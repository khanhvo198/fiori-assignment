sap.ui.define(
  [
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/m/GroupHeaderListItem",
    "sap/ui/model/type/String",
    "sap/ui/table/Column",
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
    "sap/m/Tokenizer",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    Fragment,
    Sorter,
    Filter,
    JSONModel,
    SearchField,
    GroupHeaderListItem,
    String,
    Column,
    FilterOperator,
    Token,
    Tokenizer,
    MessageToast
  ) {
    "use strict";

    return BaseController.extend("assignment.controller.workList", {
      /**
       * @override
       */
      onInit: function () {
        this._mFilters = {
          paid: [new Filter("BillingStatus", "EQ", "P")],
          unPaid: [new Filter("BillingStatus", "EQ", "")],
        };

        var oViewModel = new JSONModel({
          paid: 0,
          unPaid: 0,
          saleOrderTitle: this.getResourceBundle().getText("saleOrderTitle"),
        });

        // this._aTokens = [];

        this._aTokens = {
          orders: [],
          customers: [],
        };
        this.setModel(oViewModel, "worklistView");
      },
      onUpdatedFinished: function (oEvent) {
        var oTable = oEvent.getSource(),
          oModel = this.getModel(),
          oViewModel = this.getModel("worklistView"),
          sTitle;

        var iTotal = oEvent.getParameter("total");
        if (iTotal && oTable.getBinding("items").isLengthFinal()) {
          sTitle = this.getResourceBundle().getText("saleOrderTitleCount", [
            iTotal,
          ]);
          jQuery.each(this._mFilters, function (sFilterKey, oFilter) {
            oModel.read("/SalesOrderSet/$count", {
              filters: oFilter,
              success: function (oData) {
                var sPath = "/" + sFilterKey;
                oViewModel.setProperty(sPath, oData);
              },
            });
          });
        } else {
          sTitle = this.getResourceBundle().getText("saleOrderTitle");
        }
        this.getModel("worklistView").setProperty("/saleOrderTitle", sTitle);
      },

      onQuickFilter: function (oEvent) {
        var sKey = oEvent.getParameter("key");
        var oTableBinding = this.byId("worklist").getBinding("items");
        oTableBinding.filter(this._mFilters[sKey]);
      },

      onSearchByProductName: function (oEvent) {
        var sQuery = oEvent.getParameter("query");
        var oModel = this.getModel();
        var oFilter = [new Filter("ProductID", "EQ", sQuery)];
        oModel.read("/SalesOrderLineItemSet", {
          filters: oFilter,
          success: function (oData) {
            console.log(oData);
            var oSalesOrderFilter = [];
            oData["results"].forEach((element) => {
              oSalesOrderFilter.push(
                new Filter("SalesOrderID", "EQ", element.SalesOrderID)
              );
            });
            this.byId("worklist").getBinding("items").filter(oSalesOrderFilter);
          }.bind(this),
        });
      },

      onPress: function (oEvent) {
        this._showObject(oEvent.getSource());
      },
      _showObject: function (oItem) {
        this.getRouter().navTo("object", {
          objectId: oItem.getBindingContext().getProperty("SalesOrderID"),
        });
      },

      onGroup: function (oContext) {
        var sKey = oContext.getProperty("DeliveryStatus");
        return {
          key: sKey,
          text: sKey,
        };
      },

      groupHeader: function (oGroup) {
        var title = oGroup.key === "D" ? "Delivered" : "Initial";
        return new sap.m.GroupHeaderListItem({
          title: "Delivery Status: " + title,
          upperCase: false,
        });
      },

      handleValueHelpSalesOrder: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
          oView = this.getView();

        // create value help dialog
        if (!this._pValueHelpDialogOfSalesOrder) {
          this._pValueHelpDialogOfSalesOrder = Fragment.load({
            id: oView.getId(),
            name: "assignment.view.SearchDialogForSalesOrder",
            controller: this,
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }

        this._pValueHelpDialogOfSalesOrder.then(function (oValueHelpDialog) {
          // create a filter for the binding
          oValueHelpDialog
            .getBinding("items")
            .filter([
              new Filter("SalesOrderID", FilterOperator.Contains, sInputValue),
            ]);
          // open value help dialog filtered by the input value
          oValueHelpDialog.open(sInputValue);
        });
      },
      _handleValueHelpSearchSalesOrder: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter(
          "salesOrderID",
          FilterOperator.Contains,
          sValue
        );
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },
      _handleValueHelpCloseSalesOrder: function (oEvent) {
        var aSelectedItems = oEvent.getParameter("selectedItems"),
          oMultiInput = this.byId("multiInputForSalesOrder");
        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach(
            function (oItem) {
              console.log(oItem.getTitle());
              oMultiInput.addToken(
                new Token({
                  text: oItem.getTitle(),
                })
              );
              this._aTokens.orders.push(oItem.getTitle());
            }.bind(this)
          );
        }

        var aFilters = [];
        this._aTokens.orders.forEach((token) =>
          aFilters.push(new Filter("SalesOrderID", FilterOperator.EQ, token))
        );
        this.byId("worklist").getBinding("items").filter(aFilters);
      },

      handleValueHelpCustomer: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
          oView = this.getView();

        // create value help dialog
        if (!this._pValueHelpDialogOfCustomer) {
          this._pValueHelpDialogOfCustomer = Fragment.load({
            id: oView.getId(),
            name: "assignment.view.SearchDialogForCustomer",
            controller: this,
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }

        this._pValueHelpDialogOfCustomer.then(function (oValueHelpDialog) {
          // create a filter for the binding
          oValueHelpDialog
            .getBinding("items")
            .filter([
              new Filter("CustomerName", FilterOperator.Contains, sInputValue),
            ]);
          // open value help dialog filtered by the input value
          oValueHelpDialog.open(sInputValue);
        });
      },
      _handleValueHelpSearchCustomer: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter(
          "CustomerName",
          FilterOperator.Contains,
          sValue
        );
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },
      _handleValueHelpCloseCustomer: function (oEvent) {
        var aSelectedItems = oEvent.getParameter("selectedItems"),
          oMultiInput = this.byId("multiInputForCustomer");
        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach(
            function (oItem) {
              console.log(oItem.getTitle());
              oMultiInput.addToken(
                new Token({
                  text: oItem.getTitle(),
                })
              );
              this._aTokens.customers.push(oItem.getTitle());
            }.bind(this)
          );
        }

        var aFilters = [];
        this._aTokens.customers.forEach((token) =>
          aFilters.push(new Filter("CustomerName", FilterOperator.EQ, token))
        );
        this.byId("worklist").getBinding("items").filter(aFilters);
      },
      _onTokenUpdateForSalesOrder: function (oEvent) {
        var aTokens, i;

        if (oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Added) {
          aTokens = oEvent.getParameter("addedTokens");
        } else if (
          oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Removed
        ) {
          aTokens = oEvent.getParameter("removedTokens");
        }

        for (i = 0; i < aTokens.length; i++) {
          if (oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Added) {
            this._aTokens.orders.push(aTokens[i].getText());
          } else if (
            oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Removed
          ) {
            var indexItemRemove = this._aTokens.orders.indexOf(
              aTokens[i].getText()
            );

            if (indexItemRemove > -1) {
              this._aTokens.orders.splice(indexItemRemove, 1);
            }
          }
        }
        var aFilters = [];

        this._aTokens.orders.forEach((token) =>
          aFilters.push(new Filter("SalesOrderID", FilterOperator.EQ, token))
        );
        this.byId("worklist").getBinding("items").filter(aFilters);
      },

      _onTokenUpdateForCustomer: function (oEvent) {
        var aTokens, i;

        if (oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Added) {
          aTokens = oEvent.getParameter("addedTokens");
        } else if (
          oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Removed
        ) {
          aTokens = oEvent.getParameter("removedTokens");
        }

        for (i = 0; i < aTokens.length; i++) {
          if (oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Added) {
            this._aTokens.customers.push(aTokens[i].getText());
          } else if (
            oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Removed
          ) {
            var indexItemRemove = this._aTokens.customers.indexOf(
              aTokens[i].getText()
            );

            if (indexItemRemove > -1) {
              this._aTokens.customers.splice(indexItemRemove, 1);
            }
          }
        }
        var aFilters = [];

        this._aTokens.customers.forEach((token) =>
          aFilters.push(new Filter("CustomerName", FilterOperator.EQ, token))
        );
        this.byId("worklist").getBinding("items").filter(aFilters);
      },
    });
  }
);
