sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("assignment.controller.List", {
      onInit: function () {
        var oList = this.byId("list");

        this._oList = oList;

        var oViewModel = this._createViewModel();

        // this._oListFilterState = {
        //   aFilter: [],
        //   aSearch: [],
        // };

        this.setModel(oViewModel, "listView");
      },

      onSelectionChange: function () {},

      onOpenViewSettings: function () {},

      onSearchBySaleOrderNumber: function (oEvent) {
        // var sQuery = oEvent.getParameter("query");
        // if (sQuery === "") return;
        // this._oListFilterState.aSearch.push(
        //   new Filter("CustomerName", FilterOperator.Contains, sQuery)
        // );
        // this._applyFilterSearch();
      },

      onSearchByCustomerName: function (oEvent) {},

      onSearchByProductName: function (oEvent) {},

      onUpdateFinished: function () {},

      _createViewModel: function () {
        return new JSONModel({
          isFilterBarVisible: false,
        });
      },

      // _applyFilterSearch: function () {},
    });
  }
);
