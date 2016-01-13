'use strict';

angular.module('md.data.table').directive('mdHead', mdHead);

function mdHead($compile) {

  function compile(tElement) {
    tElement.addClass('md-head');
    return postLink;
  }
  
  function Controller($attrs) {
    var self = this;

    self.allowMultipleSorts = function() {
      return $attrs.hasOwnProperty('mdOrderMultiple') && $attrs.mdOrderMultiple === '';
    };

    if(self.allowMultipleSorts() && typeof self.order === 'undefined') {
      self.order = [];
    }
  }
  
  function postLink(scope, element, attrs, tableCtrl) {

    function attachCheckbox() {
      var children = element.children();
      
      // append an empty cell to preceding rows
      for(var i = 0; i < children.length - 1; i++) {
        children.eq(i).prepend('<th class="md-column">');
      }
      
      children.eq(children.length - 1).prepend(createCheckBox());
    }
    
    function createCheckBox() {
      var checkbox = angular.element('<md-checkbox>');
      
      checkbox.attr('aria-label', 'Select All');
      checkbox.attr('ng-click', 'toggleAll()');
      checkbox.attr('ng-checked', 'allSelected()');
      
      return angular.element('<th class="md-column md-checkbox-column">').append($compile(checkbox)(scope));
    }
    
    function getController(row) {
      return angular.element(row).controller('mdSelect');
    }
    
    function removeCheckbox() {
      var children = element.children();
      var child = children.eq(children.length - 1);
      
      Array.prototype.some.call(child.prop('cells'), function (cell) {
        return cell.classList.contains('md-checkbox-column') && child[0].removeChild(cell);
      });
    }
    
    function enableRowSelection() {
      return tableCtrl.$$rowSelect;
    }
    
    scope.allSelected = function () {
      var rows = tableCtrl.getBodyRows();
      
      return rows.length && rows.map(getController).every(function (ctrl) {
        return !ctrl || ctrl.disabled || ctrl.isSelected();
      });
    };
    
    scope.selectAll = function () {
      tableCtrl.getBodyRows().map(getController).forEach(function (ctrl) {
        if(ctrl && !ctrl.isSelected()) {
          ctrl.select();
        }
      });
    };
    
    scope.toggleAll = function () {
      return scope.allSelected() ? scope.unSelectAll() : scope.selectAll();
    };
    
    scope.unSelectAll = function () {
      tableCtrl.getBodyRows().map(getController).forEach(function (ctrl) {
        if(ctrl && ctrl.isSelected()) {
          ctrl.deselect();
        }
      });
    };
    
    scope.$watch(enableRowSelection, function (enable) {
      if(enable) {
        attachCheckbox();
      } else {
        removeCheckbox();
      }
    });
  }
  
  return {
    bindToController: true,
    compile: compile,
    controller: Controller,
    controllerAs: '$mdHead',
    require: '^^mdTable',
    restrict: 'A',
    scope: {
      order: '=?mdOrder',
      orderMultiple: '=?mdOrderMultiple',
      onReorder: '=?mdOnReorder'
    }
  };
}

mdHead.$inject = ['$compile'];