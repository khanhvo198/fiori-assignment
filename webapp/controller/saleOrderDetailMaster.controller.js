sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter",
  ],
  function (BaseController, JSONModel, MessageToast, MessageBox, formatter) {
    "use strict";

    return BaseController.extend(
      "assignment.controller.saleOrderDetailMaster",
      {
        formatter: formatter,

        onInit: function () {
          // Model used to manipulate control states. The chosen values make sure,
          // detail page shows busy indication immediately so there is no break in
          // between the busy indication for loading the view's meta data
          var oViewModel = new JSONModel({
            busy: true,
            delay: 0,
            layout: "OneColumn",
          });
          this.getRouter()
            .getRoute("object")
            .attachPatternMatched(this._onObjectMatched, this);
          this.setModel(oViewModel, "objectView");

          this.getRouter()
            .getRoute("detail")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId;
          if (!sObjectId) return;

          this.getModel()
            .metadataLoaded()
            .then(
              function () {
                var sObjectPath = this.getModel().createKey("SalesOrderSet", {
                  SalesOrderID: sObjectId,
                });
                this._bindView("/" + sObjectPath);
              }.bind(this)
            );
          this.getModel("splitAppView").setProperty("/layout", "OneColumn");
        },

        _bindView: function (sObjectPath) {
          this.getView().bindElement({
            path: sObjectPath,
            parameters: {
              expand: "ToBusinessPartner",
            },
          });
        },
        action: function (oEvent) {
          this.getRouter().navTo("detail", {
            objectId: (oEvent.getParameter("listItem") || oEvent.getSource())
              .getBindingContext()
              .getProperty("SalesOrderID"),
            itemPosition: (
              oEvent.getParameter("listItem") || oEvent.getSource()
            )
              .getBindingContext()
              .getProperty("ItemPosition"),
          });
          this.getModel("splitAppView").setProperty(
            "/layout",
            "TwoColumnsMidExpanded"
          );
        },
        onPressConfirm: function (sSalesOrderID) {
          var oModel = this.getView().getModel();
          oModel.setUseBatch(false);

          oModel.callFunction("/SalesOrder_Confirm", {
            method: "POST",
            urlParameters: { SalesOrderID: sSalesOrderID },
            success: function (oData, response) {
              MessageBox.success("Confirm success");
              oModel.setUseBatch(true);
            },
            error: function (oError) {
              MessageBox.error("Confirm error. Try later");
              oModel.setUseBatch(true);
            },
          });
        },
        onPressCreateGoodsIssue: function (sSalesOrderID) {
          var oModel = this.getModel();
          oModel.setUseBatch(false);
          oModel.callFunction("/SalesOrder_GoodsIssueCreated", {
            method: "POST",
            urlParameters: { SalesOrderID: sSalesOrderID },
            success: function (oData, response) {
              MessageBox.success("Create Goods Issue Success");
              oModel.setUseBatch(true);
            },
            error: function (oError) {
              MessageBox.error("Create Goods Issue error. Try later");
              oModel.setUseBatch(true);
            },
          });
        },
        onPressCreateInvoice: function (sSalesOrderID) {
          var oModel = this.getModel();
          oModel.setUseBatch(false);

          oModel.callFunction("/SalesOrder_InvoiceCreated", {
            method: "POST",
            urlParameters: { SalesOrderID: sSalesOrderID },
            success: function (oData, response) {
              MessageBox.success("Create Sale Order Invoice Success");
              oModel.setUseBatch(true);
            },
            error: function (oError) {
              MessageBox.error("Create Sale Order Invoice error. Try later");
              oModel.setUseBatch(true);
            },
          });
        },
        onPressCancel: function () {
          this.getRouter().navTo("worklist", {}, true);
        },
      }
    );
  }
);
