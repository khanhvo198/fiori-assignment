sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter"],
  function (BaseController, JSONModel, formatter) {
    "use strict";

    return BaseController.extend(
      "assignment.controller.saleOrderDetailDetail",
      {
        formatter: formatter,
        onInit: function () {
          // Model used to manipulate control states. The chosen values make sure,
          // detail page shows busy indication immediately so there is no break in
          // between the busy indication for loading the view's meta data

          this.getRouter()
            .getRoute("detail")
            .attachPatternMatched(this._onDetailMatched, this);
        },

        _onDetailMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId,
            sItemPosition = oEvent.getParameter("arguments").itemPosition;

          this.getModel()
            .metadataLoaded()
            .then(
              function () {
                var sObjectPath = this.getModel().createKey(
                  "SalesOrderLineItemSet",
                  {
                    SalesOrderID: sObjectId,
                    ItemPosition: sItemPosition,
                  }
                );
                this._bindView("/" + sObjectPath);
              }.bind(this)
            );
          this.getModel("splitAppView").setProperty(
            "/layout",
            "TwoColumnsMidExpanded"
          );
        },

        _bindView: function (sObjectPath) {
          this.getView().bindElement({
            path: sObjectPath,
            parameters: {
              expand: "ToProduct",
            },
          });
        },
        onPressBreadcumbsSalesOrderID: function (oEvent) {
          this.getRouter().navTo(
            "object",
            {
              objectId: oEvent.getSource().getText(),
            },
            false
          );
          this.getModel("splitAppView").setProperty("/layout", "OneColumn");
        },
      }
    );
  }
);
