sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("assignment.controller.App", {
      onInit: function () {
        var oViewModel = new JSONModel({
          layout: "OneColumn",
          previousLayout: "",
        });

        this.setModel(oViewModel, "appView");
      },
    });
  }
);
