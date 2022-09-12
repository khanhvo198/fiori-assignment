sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("assignment.controller.List", {
    onInit: function () {
      var oList = this.byId("list");

      this._oList = oList;
    },

    onSelectionChange: function () {},

    onOpenViewSettings: function () {},

    onSearch: function (oEvent) {},

    onUpdateFinished: function () {},
  });
});
