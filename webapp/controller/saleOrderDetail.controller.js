sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("assignment.controller.saleOrderDetail", {
      onInit: function () {
        // Model used to manipulate control states. The chosen values make sure,
        // detail page shows busy indication immediately so there is no break in
        // between the busy indication for loading the view's meta data
        var oViewModel = new JSONModel({
          busy: true,
          delay: 0,
        });
        this.getRouter()
          .getRoute("object")
          .attachPatternMatched(this._onObjectMatched, this);
        this.setModel(oViewModel, "objectView");
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
        });
      },
    });
  }
);
