(function() {
  var DOWN, DropSelect, ENTER, ESCAPE, SPACE, Select, UP, currentFocusedSelect, lastKeysPressed, lastKeysTimeout;

  DropSelect = Drop.createContext();

  ENTER = 13;

  ESCAPE = 27;

  SPACE = 32;

  UP = 38;

  DOWN = 40;

  currentFocusedSelect = void 0;

  lastKeysPressed = '';

  lastKeysTimeout = void 0;

  $(window).on('keydown keypress', function(e) {
    var $focusedTarget, select, _ref, _ref1;
    $focusedTarget = $('.drop-select-target-focused:first');
    if (!($focusedTarget.length && $focusedTarget.data('select'))) {
      return;
    }
    select = $focusedTarget.data('select');
    clearTimeout(lastKeysTimeout);
    if (select.dropSelect.isOpened() && e.keyCode === ESCAPE) {
      select.dropSelect.close();
      select.$target.focus();
    }
    if (!select.dropSelect.isOpened() && ((_ref = e.keyCode) === UP || _ref === DOWN || _ref === SPACE)) {
      select.dropSelect.open();
      e.preventDefault();
      return;
    }
    if (select.dropSelect.isOpened() && e.keyCode === ENTER) {
      select.selectHighlightedOption();
      return;
    }
    if (select.dropSelect.isOpened() && ((_ref1 = e.keyCode) === UP || _ref1 === DOWN)) {
      select.moveHighlight(e.keyCode === UP ? 'up' : 'down');
      e.preventDefault();
      return;
    }
    if (e.charCode === 0) {
      return;
    }
    lastKeysPressed += String.fromCharCode(e.charCode);
    select.highlightOptionWithText(lastKeysPressed);
    return lastKeysTimeout = setTimeout(function() {
      return lastKeysPressed = '';
    }, 500);
  });

  Select = (function() {
    function Select(options) {
      this.options = options;
      this.$select = $(this.options.el);
      this.setupTarget();
      this.createDrop();
      this.renderDrop();
      this.setupEvents();
    }

    Select.prototype.setupTarget = function() {
      var $options, dataPlaceholder, placeholder, val,
        _this = this;
      val = this.$select.val();
      $options = this.$select.find('option');
      if (val && val !== '') {
        placeholder = this.$select.find('option:selected').text();
      } else {
        dataPlaceholder = this.$select.attr('data-placeholder');
        if (dataPlaceholder && dataPlaceholder !== '') {
          placeholder = dataPlaceholder;
        } else {
          placeholder = this.$select.find('option:first').text();
        }
      }
      this.$target = $("<a href=\"javascript:;\" class=\"drop-select-target\">" + placeholder + "<b></b></a>");
      this.$target.data('select', this);
      this.$target.on('click', function() {
        return _this.$target.focus();
      });
      this.$target.on('focus', function() {
        return _this.$target.addClass('drop-select-target-focused');
      });
      this.$target.on('blur', function() {
        _this.dropSelect.close();
        return _this.$target.removeClass('drop-select-target-focused');
      });
      return this.$select.after(this.$target).hide();
    };

    Select.prototype.renderTarget = function() {
      this.$target.text(this.$select.find('option:selected').text());
      return this.$target.append('<b></b>');
    };

    Select.prototype.getSelectedOption = function() {
      return this.dropSelect.$drop.find('[data-selected="true"]');
    };

    Select.prototype.createDrop = function() {
      var _this = this;
      this.dropSelect = new DropSelect({
        target: this.$target[0],
        className: 'drop-select-theme-default',
        attach: 'bottom left',
        constrainToWindow: true,
        constrainToScrollParent: true,
        trigger: 'click'
      });
      return this.dropSelect.$drop.on('dropopen', function() {
        _this.dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight');
        return _this.getSelectedOption().addClass('drop-select-option-highlight');
      });
    };

    Select.prototype.renderDrop = function() {
      var $dropSelectOptions;
      $dropSelectOptions = $('<ul class="drop-select-options"></ul>');
      this.$select.find('option').each(function() {
        var $option;
        $option = $(this);
        return $dropSelectOptions.append("<li data-selected=\"" + ($option.is(':selected')) + "\" class=\"drop-select-option\" data-value=\"" + this.value + "\">" + ($option.text()) + "</li>");
      });
      return this.dropSelect.$drop.find('.drop-content').html($dropSelectOptions[0]);
    };

    Select.prototype.highlightOptionWithText = function(text) {
      var $option, currentHighlightedIndex, i, option, options, optionsChecked, that;
      that = this;
      if (that.dropSelect.isOpened()) {
        options = this.dropSelect.$drop.find('.drop-select-option').toArray();
        currentHighlightedIndex = this.dropSelect.$drop.find('.drop-select-option-highlight').index();
      } else {
        options = this.$select.find('option').toArray();
        currentHighlightedIndex = this.$select.find('option:selected').index();
      }
      if (currentHighlightedIndex == null) {
        return;
      }
      optionsChecked = 0;
      i = currentHighlightedIndex + 1;
      while (optionsChecked < options.length) {
        if (i > options.length - 1) {
          i = 0;
        }
        if (i === currentHighlightedIndex) {
          break;
        }
        option = options[i];
        $option = $(option);
        if (!that.dropSelect.isOpened()) {
          if ($option.text().toLowerCase().charAt(0) === text.toLowerCase().charAt(text.length - 1)) {
            this.$select.val($option.val());
            this.renderDrop();
            this.renderTarget();
            return;
          }
        } else {
          if ($option.text().toLowerCase().substr(0, text.length) === text.toLowerCase()) {
            that.dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight');
            $option.addClass('drop-select-option-highlight');
            return;
          }
        }
        optionsChecked += 1;
        i += 1;
      }
    };

    Select.prototype.selectHighlightedOption = function() {
      return this.selectOption(this.dropSelect.$drop.find('.drop-select-option-highlight')[0]);
    };

    Select.prototype.moveHighlight = function(direction) {
      var $currentSelection, $newSelection, $next, $prev;
      $currentSelection = this.dropSelect.$drop.find('.drop-select-option-highlight');
      if (!$currentSelection.length) {
        $newSelection = this.dropSelect.$drop.find('.drop-select-option:first');
      } else {
        $prev = $currentSelection.prev();
        $next = $currentSelection.next();
        if (direction === 'up' && $prev.length) {
          $newSelection = $prev;
        } else if (direction === 'up') {
          $newSelection = $currentSelection;
        }
        if (direction === 'down' && $next.length) {
          $newSelection = $next;
        } else if (direction === 'down') {
          $newSelection = $currentSelection;
        }
      }
      this.dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight');
      return $newSelection.addClass('drop-select-option-highlight');
    };

    Select.prototype.selectOption = function(option) {
      var _this = this;
      this.$select.val($(option).data('value'));
      this.renderDrop();
      this.renderTarget();
      return setTimeout((function() {
        _this.dropSelect.close();
        return _this.$target.focus();
      }), 0);
    };

    Select.prototype.setupEvents = function() {
      var _this = this;
      this.$select.on('change', function() {
        this.renderDrop();
        return this.renderTarget();
      });
      this.dropSelect.$drop.on('click', '.drop-select-option', function(e) {
        return _this.selectOption(e.target);
      });
      return this.dropSelect.$drop.on('mousemove', '.drop-select-option', function(e) {
        _this.dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight');
        return $(e.target).addClass('drop-select-option-highlight');
      });
    };

    return Select;

  })();

  window.Select = Select;

}).call(this);