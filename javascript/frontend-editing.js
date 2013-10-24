function addHTMLEditors() {
	var baseURL = jQuery('base').attr('href');
	jQuery('.frontend-editable-html').each(function (index, element) {
		var jElement = jQuery(element);
		jElement.attr('contenteditable', true);
		var editor = jElement.ckeditor().editor;

		jElement.data('originalContent', editor.getData());

		//callback for save
		var command = editor.addCommand('save', {
			element: jElement,
			exec: function (editor) {

				this.element.data('originalContent', editor.getData());
				editor.setReadOnly(true);
				jQuery.post(baseURL + 'home/fesave', {
					fefield: this.element.data('fefield'),
					feid: this.element.data('feid'),
					feclass: this.element.data('feclass'),
					value: editor.getData()
				}, function (data) {
					editor.setReadOnly(false);
					editor.fire('blur');
					//webkit hack :D
					jQuery('<div contenteditable="true"></div>').insertBefore(element).focus().remove();
				});
			}
		});

		//callback for cancel
		var command = editor.addCommand('cancel', {
			element: jElement,
			exec: function (editor) {
				editor.setData(this.element.data('originalContent'));
				editor.setReadOnly(false);
				editor.fire('blur');
				//webkit hack :D
				jQuery('<div contenteditable="true"></div>').insertBefore(element).focus().remove();
			}
		});

		//add save button
		editor.ui.addButton && editor.ui.addButton('Save', {
			label: 'Save',
			command: 'save',
			toolbar: 'mode,0',
			icon: baseURL + "frontend-editing/images/save.png"
		});

		//add cancel button
		editor.ui.addButton && editor.ui.addButton('Cancel', {
			label: 'Cancel',
			command: 'cancel',
			toolbar: 'mode,0',
			icon: baseURL + "frontend-editing/images/cancel.png"
		});
	});
}

function initFrontendEditor() {

	//Basic
	var baseURL = jQuery('base').attr('href');
	CKEDITOR.config.contentsCss = THEME_DIR + '/css/editor.css';
	CKEDITOR.config.allowedContent = true;
	CKEDITOR.disableAutoInline = true;

	//Inline editing
	jQuery('.frontend-editable').each(function (index, element) {
		var jElement = jQuery(element);

		//all fields, except the html fields, are editable through the editable jquery plugin
		if (!jElement.hasClass('frontend-editable-html')) {
			jElement.editable(baseURL + 'home/fesave', {
				type: jElement.hasClass('frontend-editable-html') ? 'textarea' : 'text',
				cancel: 'Cancel',
				submit: 'Save',
				indicator: '<img src="' + baseURL + 'frontend-editing/images/indicator.gif">',
				submitdata: {
					fefield: jElement.data('fefield'),
					feid: jElement.data('feid'),
					feclass: jElement.data('feclass')
				},
				event: 'click',
				onblur: 'ignore',
				onedit: function () {
					if (!jQuery('#frontend-editing-toggle').prop('checked')) {
						return false;
					}
					var timer = setInterval(function () {
						var buttons = jElement.find('button');
						if (buttons.length > 0) {
							jElement.find('button[type="submit"]').addClass('btn btn-success');
							jElement.find('button[type="cancel"]').addClass('btn btn-danger');
							jElement.find('input, textarea').addClass('form-control').click(function (e) {
								return false;
							});
							jElement.find('textarea').ckeditor();

							clearInterval(timer);
						}
					}, 20);
				}
			});
		}
	});
	//detect html areas
	addHTMLEditors();

	//detect if toolbar should be collapsed on start
	var hideToolbar = localStorage.frontendEditingToolbar == 0;


	//create toolbar
	var toolbar = jQuery('<div id="frontend-editing-toolbar" />');
	var adminLink = jQuery('meta[name="x-cms-edit-link"]').attr('content');
	toolbar.append('<a class="displaytoggle" href="#">'+(hideToolbar?"Show":"Hide")+'</a>');
	var toolbarOptions = jQuery('<div class="options"></div>');
	toolbar.append(toolbarOptions);
	toolbarOptions.append('<a href="' + baseURL + '/Security/Logout">Logout</a>');
	toolbarOptions.append('<a href="' + adminLink + '">Admin</a>');

	//detect if frontend editing should be on or off
	var toggle = (localStorage.frontendEditingToggle !== undefined && localStorage.frontendEditingToggle != 0) || localStorage.frontendEditingToggle === undefined ? " checked" : "";
	toolbarOptions.append('<label><input type="checkbox" id="frontend-editing-toggle"' + toggle + '> Frontend editing</label>');

	//detect if highlight editables should be on or off
	var highlight = (localStorage.frontendEditingHighlight !== undefined && localStorage.frontendEditingHighlight != 0) ? " checked" : "";
	toolbarOptions.append('<label><input type="checkbox" id="frontend-editing-highlight"' + highlight + '> Highlight editables</label>');

	//add toolbar to body
	jQuery('body').append(toolbar);

	//show or hide the toolbar default
	if (hideToolbar) {
		toolbarOptions.hide();
		toolbar.css('width', '60px');
		jQuery('.displaytoggle').data("hidden",true)
	}
	else {
		toolbar.css('width', '100%');
	}

	//bind highlight checkbox
	jQuery('#frontend-editing-highlight').change(function () {
		if (jQuery('#frontend-editing-highlight').prop('checked')) {
			localStorage.frontendEditingHighlight = 1;
			jQuery('.frontend-editable').addClass('frontend-editable-hightlight');
		} else {
			localStorage.frontendEditingHighlight = 0;
			jQuery('.frontend-editable').removeClass('frontend-editable-hightlight');
		}
	});

	//bind toggle checkbox
	jQuery('#frontend-editing-toggle').change(function () {
		if (jQuery('#frontend-editing-toggle').prop('checked')) {
			localStorage.frontendEditingToggle = 1;
			addHTMLEditors();
		} else {
			localStorage.frontendEditingToggle = 0;
			jQuery('.frontend-editable-html').attr('contenteditable', false);
			for (var name in CKEDITOR.instances) {
				CKEDITOR.instances[name].destroy()
			}
		}
	});

	//bind showhide
	toolbar.find('a.displaytoggle').click(function (e) {
		e.preventDefault();
		var $this = jQuery(this);
		if (!$this.data('hidden')) {
			localStorage.frontendEditingToolbar = 0;
			$this.html('Show');
			toolbarOptions.hide();
			toolbar.css('width', '60px');

			$this.data('hidden', true);
		} else {
			localStorage.frontendEditingToolbar = 1;
			$this.html('Hide');
			toolbar.css('width', '100%');
			setTimeout(function () {
				toolbarOptions.show();
			}, 10);

			$this.data('hidden', false);
		}
		jQuery(this).blur();
	});
	setTimeout(function () {
		jQuery('#frontend-editing-highlight').trigger('change');
		jQuery('#frontend-editing-toggle').trigger('change');
	}, 400);

	//Title fix, detect html
	if (jQuery('title').text().search("<") != -1) {
		var originalTitle = jQuery(jQuery('title').text());
		jQuery('title').html(originalTitle.text());
	}
}

jQuery(document).ready(function () {
	//iframe detection
	if (top.location == self.location) {
		initFrontendEditor();
	}
});