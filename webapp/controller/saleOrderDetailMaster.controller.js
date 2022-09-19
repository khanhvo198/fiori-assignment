sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend(
      "assignment.controller.saleOrderDetailMaster",
      {
        onInit: function () {
          console.log("asdasd");
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
      }
    );
  }
);
