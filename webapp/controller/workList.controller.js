sap.ui.define(
  [
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/m/GroupHeaderListItem",
  ],
  function (
    BaseController,
    Fragment,
    Sorter,
    Filter,
    JSONModel,
    GroupHeaderListItem
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

      onSearchBySaleOrderNumber: function (oEvent) {},
      onSearchByCustomerName: function (oEvent) {},
      onSearchByProductName: function (oEvent) {},

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
    });
  }
);
