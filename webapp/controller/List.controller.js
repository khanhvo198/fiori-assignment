sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("assignment.controller.List", {
      onInit: function () {
        var oList = this.byId("list");

        this._oList = oList;

        var oViewModel = this._createViewModel();

        this.setModel(oViewModel, "listView");
      },

      onSelectionChange: function () {},

      onOpenViewSettings: function () {},

      onSearchBySaleOrderNumber: function () {},
      onSearchByCustomerName: function () {},

      onSearchByProductName: function () {},

      onUpdateFinished: function () {},

      _createViewModel: function () {
        return new JSONModel({
          isFilterBarVisible: false,
        });
      },
    });
  }
);
