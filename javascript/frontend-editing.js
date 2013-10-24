function addHTMLEditors() {
    var baseURL = jQuery('base').attr('href');
    jQuery('.frontend-editable-html').each(function (index, element) {
        var jElement = jQuery(element);
        jElement.attr('contenteditable', true);
        var editor = jElement.ckeditor().editor;

        jElement.data('originalContent',editor.getData());

        //callback for save
        var command = editor.addCommand( 'save',{
            element: jElement,
            exec: function( editor ) {

                this.element.data('originalContent',editor.getData());
                editor.setReadOnly(true);
                jQuery.post(baseURL + 'home/fesave',{
                    fefield: this.element.data('fefield'),
                    feid: this.element.data('feid'),
                    feclass: this.element.data('feclass'),
                    value: editor.getData()
                },function(data) {
                    editor.setReadOnly(false);
                    editor.fire( 'blur' );
                    //webkit hack :D
                    jQuery('<div contenteditable="true"></div>').insertBefore(element).focus().remove();
                });
            }
        });

        //callback for cancel
        var command = editor.addCommand( 'cancel',{
            element: jElement,
            exec: function( editor ) {
                editor.setData(this.element.data('originalContent'));
                editor.setReadOnly(false);
                editor.fire( 'blur' );
                //webkit hack :D
                jQuery('<div contenteditable="true"></div>').insertBefore(element).focus().remove();
            }
        });

        //add save button
        editor.ui.addButton && editor.ui.addButton( 'Save', {
            label: 'Save',
            command: 'save',
            toolbar: 'mode,0',
            icon:baseURL+"frontend-editing/images/save.png"
        });

        //add cancel button
        editor.ui.addButton && editor.ui.addButton( 'Cancel', {
            label: 'Cancel',
            command: 'cancel',
            toolbar: 'mode,0',
            icon:baseURL+"frontend-editing/images/cancel.png"
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
    addHTMLEditors();

	//Toolbar
	var toolbar = jQuery('<div id="frontend-editing-toolbar" />');
	var adminLink = jQuery('meta[name="x-cms-edit-link"]').attr('content');
	toolbar.append('<a class="displaytoggle" href="#">Hide</a>');
	var toolbarOptions = jQuery('<div class="options"></div>');
	toolbar.append(toolbarOptions);
	toolbarOptions.append('<a href="' + baseURL + '/Security/Logout">Logout</a>');
	toolbarOptions.append('<a href="' + adminLink + '">Admin</a>');
	toolbarOptions.append('<label><input type="checkbox" id="frontend-editing-toggle" checked> Frontend editing</label>');
	toolbarOptions.append('<label><input type="checkbox" id="frontend-editing-highlight"> Highlight editables</label>');
	jQuery('body').append(toolbar);
	jQuery('#frontend-editing-highlight').change(function () {
		if (jQuery('#frontend-editing-highlight').prop('checked')) {
			jQuery('.frontend-editable').addClass('frontend-editable-hightlight');
		} else {
			jQuery('.frontend-editable').removeClass('frontend-editable-hightlight');
		}
	});
    jQuery('#frontend-editing-toggle').change(function () {
        if (jQuery('#frontend-editing-toggle').prop('checked')) {
            addHTMLEditors();
        } else {
            jQuery('.frontend-editable-html').attr('contenteditable', false);
            for(var name in CKEDITOR.instances){
                CKEDITOR.instances[name].destroy()
            }
        }
    });
	toolbar.find('a.displaytoggle').click(function (e) {
		e.preventDefault();
		var $this = jQuery(this);
		if (!$this.data('hidden')) {
			$this.html('Show');
			toolbarOptions.hide();
			toolbar.css('width', '60px');

			$this.data('hidden', true);
		} else {
			$this.html('Hide');
			toolbar.css('width', '100%');
			setTimeout(function () {
				toolbarOptions.show();
			}, 300);

			$this.data('hidden', false);
		}
		jQuery(this).blur();
	});

	//Title fix
	jQuery('title').contents().unwrap();
}

jQuery(document).ready(function () {
	//iframe detection
	if (top.location == self.location) {
		initFrontendEditor();
	}
});