sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("assignment.controller.saleOrderDetail", {
      onInit: function () {
        var oViewModel = new JSONModel({
          layout: "OneColumn",
        });

        this.setModel(oViewModel, "splitAppView");
      },
    });
  }
);
