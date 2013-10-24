<?php


class FrontendEditingExtensions extends Extension
{

	private static $allowed_actions = array(
		'fesave'
	);

	/**
	 * add requirements for frontend editing only when logged in
	 */
	public function onBeforeInit()
	{
		if (Permission::check('ADMIN')) {
			Requirements::customScript(" var THEME_DIR = '" . Director::baseURL() . $this->owner->ThemeDir() . "'; ");
			Requirements::javascript(FRAMEWORK_DIR . '/thirdparty/jquery/jquery.min.js');
			Requirements::javascript('frontend-editing/javascript/jquery.jeditable.js');
			Requirements::javascript('frontend-editing/thirdparty/ckeditor/ckeditor.js');
			Requirements::javascript('frontend-editing/thirdparty/ckeditor/adapters/jquery.js');
			Requirements::javascript('frontend-editing/javascript/frontend-editing.js');
			Requirements::css('frontend-editing/css/frontend-editing.css');
		}
	}

	/**
	 * saves the DBField value, called with an ajax request
	 * @return bool
	 */
	public function fesave()
	{
		if (Permission::check('ADMIN')) {
			$feclass = $_REQUEST['feclass'];
			$fefield = $_REQUEST['fefield'];
			$feid = $_REQUEST['feid'];
			$value = $_REQUEST['value'];
			$obj = DataObject::get_by_id($feclass, $feid);
			$obj->$fefield = $value;
			$obj->write();
			if ($feclass::has_extension('Versioned')) {
				$obj->publish('Live', 'Stage');
			}
			return $value;
		}
		if (array_key_exists($_REQUEST, 'value')) {
			return $_REQUEST['value'];
		}
		return false;
	}

}

class FrontendEditing
{

	/**
	 * Remember the classname and the ID for the given $dbField
	 * @param DBField $dbField
	 * @param $value
	 * @param null $record
	 */
	public static function setValue(DBField $dbField, $value, $record = null)
	{
		if (Controller::curr() instanceof Page_Controller && Permission::check('ADMIN')) {
			if ($record && is_object($record) && $dbField->getName()) {
				$dbField->makeEditable = true;
				$dbField->editClassName = $record->ClassName;
				$dbField->editID = $record->ID;
			}
		}
	}

	/**
	 * returns if the dbfield is editable
	 * @param DBField $dbField
	 * @return bool
	 */
	public static function isEditable(DBField $dbField)
	{
		return isset($dbField->makeEditable) && $dbField->makeEditable;
	}

	/**
	 * returns the classname for the given DBField
	 * @param DBField $dbField
	 * @return mixed
	 */
	public static function getClassName(DBField $dbField)
	{
		return $dbField->editClassName;
	}

	/**
	 * returns the ID for the given DBField
	 * @param DBField $dbField
	 * @return mixed
	 */
	public static function getID(DBField $dbField)
	{
		return $dbField->editID;
	}

}
