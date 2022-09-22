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
        var oMultiInputWithSuggestions;
        oMultiInputWithSuggestions = this.byId("multiInputWithSuggestions");
        oMultiInputWithSuggestions.addValidator(this._onMultiInputValidate);
        // oMultiInputWithSuggestions.setTokens(this._getDefaultTokens());
        this._oMultiInputWithSuggestions = oMultiInputWithSuggestions;

        this._aTokens = [];

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

      _onMultiInputValidate: function (oArgs) {
        var sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

        if (oArgs.suggestionObject) {
          var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
            oToken = new Token(),
            sOriginalText = oObject.SalesOrderID.replaceAll(
              sWhitespace + sWhitespace,
              sWhitespace + sUnicodeWhitespaceCharacter
            );

          // oToken.setKey(oObject.SalesOrderID);
          oToken.setText("ID" + " (" + sOriginalText + ")");
          return oToken;
        }
        return null;
      },

      onQuickFilter: function (oEvent) {
        var sKey = oEvent.getParameter("key");
        var oTableBinding = this.byId("worklist").getBinding("items");
        oTableBinding.filter(this._mFilters[sKey]);
      },

      onSearchBySaleOrderNumber: function (oEvent) {},
      onSearchByCustomerName: function (oEvent) {},
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

      getGroup: function (oGroup) {
        var tmp = oGroup.sPath.split("/")[1];
        console.log(tmp);
        return {
          key:
            "Delivery Status: " +
            oGroup.oModel.oData[tmp].BillingStatusDescription,
        };
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

      onValueHelpWithSuggestionsRequested: function () {
        this._oBasicSearchFieldWithSuggestions = new SearchField();
        if (!this.pDialogWithSuggestions) {
          this.pDialogWithSuggestions = this.loadFragment({
            name: "assignment.view.ValueHelpDialogFilterbarWithSuggestions",
          });
        }
        this.pDialogWithSuggestions.then(
          function (oDialogSuggestions) {
            var oFilterBar = oDialogSuggestions.getFilterBar();
            this._oVHDWithSuggestions = oDialogSuggestions;

            // Initialise the dialog with model only the first time. Then only open it
            if (this._bDialogWithSuggestionsInitialized) {
              // Re-set the tokens from the input and update the table
              oDialogSuggestions.setTokens([]);
              oDialogSuggestions.setTokens(
                this._oMultiInputWithSuggestions.getTokens()
              );
              oDialogSuggestions.update();

              oDialogSuggestions.open();
              return;
            }
            this.getView().addDependent(oDialogSuggestions);

            // Set key fields for filtering in the Define Conditions Tab
            oDialogSuggestions.setRangeKeyFields([
              {
                label: "Sale Order ID",
                key: "SalesOrderID",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 10,
                  }
                ),
              },
            ]);

            // // Set Basic Search for FilterBar
            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setBasicSearch(this._oBasicSearchFieldWithSuggestions);

            // // Trigger filter bar search when the basic search is fired
            this._oBasicSearchFieldWithSuggestions.attachSearch(function () {
              oFilterBar.search();
            });

            oDialogSuggestions.getTableAsync().then(
              function (oTable) {
                // oTable.setModel(this.oProductsModel);

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "/SalesOrderSet",
                    events: {
                      dataReceived: function () {
                        oDialogSuggestions.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new UIColumn({
                      label: "Sales Order ID",
                      template: "SalesOrderID",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                // if (oTable.bindItems) {
                //   // Bind items to the ODataModel and add columns
                //   oTable.bindAggregation("items", {
                //     path: "/ZSALESREPORTSuggestions",
                //     template: new ColumnListItem({
                //       cells: [
                //         new Label({ text: "{ProductCode}" }),
                //         new Label({ text: "{ProductName}" }),
                //       ],
                //     }),
                //     events: {
                //       dataReceived: function () {
                //         oDialogSuggestions.update();
                //       },
                //     },
                //   });
                //   oTable.addColumn(
                //     new MColumn({ header: new Label({ text: "Product Code" }) })
                //   );
                //   oTable.addColumn(
                //     new MColumn({ header: new Label({ text: "Product Name" }) })
                //   );
                // }
                oDialogSuggestions.update();
              }.bind(this)
            );

            oDialogSuggestions.setTokens(
              this._oMultiInputWithSuggestions.getTokens()
            );
            this._bDialogWithSuggestionsInitialized = true;
            oDialogSuggestions.open();
          }.bind(this)
        );
      },

      onValueHelpWithSuggestionsOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        this._oMultiInputWithSuggestions.setTokens(aTokens);
        var length = this._oMultiInputWithSuggestions.getTokens().length;
        var aFilters = [];
        for (let i = 0; i < length; i++) {
          aFilters.push(
            new Filter(
              "SalesOrderID",
              FilterOperator.EQ,
              this._oMultiInputWithSuggestions.getTokens()[i].getProperty("key")
            )
          );
        }
        this.byId("worklist").getBinding("items").filter(aFilters);
        this._oVHDWithSuggestions.close();
      },

      onValueHelpWithSuggestionsCancelPress: function () {
        this._oVHDWithSuggestions.close();
      },

      onFilterBarWithSuggestionsSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchFieldWithSuggestions.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet"),
          aFilters =
            aSelectionSet &&
            aSelectionSet.reduce(function (aResult, oControl) {
              if (oControl.getValue()) {
                aResult.push(
                  new Filter({
                    path: oControl.getName(),
                    operator: FilterOperator.Contains,
                    value1: oControl.getValue(),
                  })
                );
              }

              return aResult;
            }, []);

        aFilters.push(
          new Filter({
            filters: [
              new Filter({
                path: "SalesOrderID",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
            ],
            and: false,
          })
        );

        this._filterTableWithSuggestions(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
      },
      _filterTableWithSuggestions: function (oFilter) {
        var oVHD = this._oVHDWithSuggestions;
        oVHD.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }
          oVHD.update();
        });
      },

      handleValueHelpCustomer: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
          oView = this.getView();

        // create value help dialog
        if (!this._pValueHelpDialog) {
          this._pValueHelpDialog = Fragment.load({
            id: oView.getId(),
            name: "assignment.view.SearchDialogForCustomer",
            controller: this,
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }

        this._pValueHelpDialog.then(function (oValueHelpDialog) {
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
              this._aTokens.push(oItem.getTitle());
            }.bind(this)
          );
        }

        var aFilters = [];
        this._aTokens.forEach((token) =>
          aFilters.push(new Filter("CustomerName", FilterOperator.EQ, token))
        );
        this.byId("worklist").getBinding("items").filter(aFilters);
      },

      _onTokenUpdate: function (oEvent) {
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
            this._aTokens.push(aTokens[i].getText());
          } else if (
            oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Removed
          ) {
            var indexItemRemove = this._aTokens.indexOf(aTokens[i].getText());

            if (indexItemRemove > -1) {
              this._aTokens.splice(indexItemRemove, 1);
            }
            console.log(this._aTokens);
          }
        }
        var aFilters = [];

        this._aTokens.forEach((token) =>
          aFilters.push(new Filter("CustomerName", FilterOperator.EQ, token))
        );
        this.byId("worklist").getBinding("items").filter(aFilters);
      },
    });
  }
);
