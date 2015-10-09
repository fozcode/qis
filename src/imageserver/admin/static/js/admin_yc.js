/*!
	Document:      admin.js
	Date started:  30 Oct 2012
	By:            Matt Fozard
	Purpose:       Quru Image Server administration area JS
	Requires:      base.js
	               MooTools More - Fx.Slide, Sortables
	               Picker
	Copyright:     Quru Ltd (www.quru.com)
	Licence:

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see http://www.gnu.org/licenses/

	Last Changed:  $Date$ $Rev$ by $Author$
	
	Notable modifications:
	Date       By    Details
	=========  ====  ============================================================
*/
"use strict";
var GenericListPage={};GenericListPage.initPopupLinks=function(b,c){var a=$$(".popuplink");a.each(function(d){popup_convert_anchor(d,b,c,function(){window.location.reload();
});});};GenericListPage.initDeleteLinks=function(b){var c=b.substring(0,1).toUpperCase()+b.substring(1);
var a=$$(".delform");a.each(function(d){setAjaxJsonForm(d,function(){return confirm("Are you sure you want to delete "+b+" '"+d.del_name.value+"'?");
},null,function(){alert(c+" deleted successfully.");window.location.reload();},function(e,g){var f=getAPIError(e,g);
alert("Sorry, this "+b+" was not deleted.\n\n"+f.message);});});};var UserList={};UserList.onInit=function(){GenericListPage.initPopupLinks(575,650);
GenericListPage.initDeleteLinks("user");};var GroupList={};GroupList.onInit=function(){GenericListPage.initPopupLinks(700,650);
GenericListPage.initDeleteLinks("group");};var UserEdit={};UserEdit.onInit=function(){GenericPopup.initButtons();
setAjaxJsonForm("editform",UserEdit.validate,GenericPopup.defaultSubmitting,GenericPopup.defaultSubmitSuccess,UserEdit.onSubmitError);
};UserEdit.validate=function(){form_clearErrors("editform");if(!validate_isempty("email")&&!validate_email("email")){form_setError("email");
alert("The user's email address does not appear to be valid.");return false;}if(validate_isempty("username")){form_setError("username");
alert("You must enter a username for the user.");return false;}if(validate_isempty("password")&&($("editform").user_id.value=="0")){form_setError("password");
alert("You must enter a password for the user.");return false;}if(!validate_isempty("password")&&!validate_length("password",6)){form_setError("password");
alert("The user's password must be 6 characters or longer.");return false;}return true;};UserEdit.onSubmitError=function(a,c){GenericPopup.enableButtons();
var b=getAPIError(a,c);if(b.status==APICodes.ALREADY_EXISTS){form_setError("username");alert("This username is already in use, please choose another.");
}else{alert("Sorry, your changes were not saved.\n\n"+b.message);}};var GroupEdit={};GroupEdit.onInit=function(){GenericPopup.initButtons();
setAjaxJsonForm("editform",GroupEdit.validate,GenericPopup.defaultSubmitting,GroupEdit.onSubmitSuccess,GroupEdit.onSubmitError);
GroupEdit.sortables=new Sortables("#members_in, #members_out",{clone:true,opacity:0.5,revert:false,onComplete:GroupEdit.onDrop});
$$(".member").each(function(a){setDoubleClickHandler(a,function(){GroupEdit.onDoubleClick(a);});});addEventEx("add_all","click",function(){GroupEdit.addRemoveAll(true);
});addEventEx("remove_all","click",function(){GroupEdit.addRemoveAll(false);});};GroupEdit.validate=function(){form_clearErrors("editform");
if(validate_isempty("name")){form_setError("name");alert("You must enter a name for the group.");return false;
}return true;};GroupEdit.onSubmitSuccess=function(a){if($("editform").group_id.value>0){GenericPopup.closePage();
}else{var b=a.data.id,d=window.location.href,c=d.replace("/0/","/"+b+"/");window.location=c;}};GroupEdit.onSubmitError=function(a,c){GenericPopup.enableButtons();
var b=getAPIError(a,c);if(b.status==APICodes.ALREADY_EXISTS){form_setError("name");alert("A group with this name already exists, please choose another name.");
}else{alert("Sorry, your changes were not saved.\n\n"+b.message);}};GroupEdit.onDrop=function(a){var b=a.getParent();
if(b&&(b.id=="members_in")&&(a.getProperty("data-member")!="in")){GroupEdit.updateMember(a,"post");}else{if(b&&(b.id=="members_out")&&(a.getProperty("data-member")!="out")){GroupEdit.updateMember(a,"delete");
}}};GroupEdit.updateMember=function(d,f){var c=d.id,e=$("memberform"),b=e.action+(f=="delete"?(c+"/"):""),a=(f=="delete"?"out":"in");
$("members_status").fade("show");$("members_status").innerHTML="Saving...";new Request.JSON({url:b,method:f,emulation:false,data:"user_id="+c,noCache:true,onSuccess:function(h,g){$("members_status").innerHTML="Saved.";
d.setProperty("data-member",a);if(GroupEdit.bulkOpSource!=undefined){setTimeout(GroupEdit.bulkOp,1);}else{setTimeout(function(){$("members_status").fade("out");
},2000);}},onFailure:function(h){$("members_status").innerHTML="Not saved.";var g=getAPIError(h.status,h.responseText?h.responseText:h.statusText);
alert("Sorry, your changes were not saved.\n\n"+g.message);if(GroupEdit.bulkOpSource!=undefined){setTimeout(GroupEdit.bulkOpEnd,1);
}}}).send();};GroupEdit.onDoubleClick=function(a){if(a.getProperty("data-member")=="in"){$("members_out").grab(a);
GroupEdit.onDrop(a);}else{if(a.getProperty("data-member")=="out"){$("members_in").grab(a);GroupEdit.onDrop(a);
}}};GroupEdit.addRemoveAll=function(a){if(!confirm("Are you sure you want to "+(a?"add all users to the group?":"empty the group?"))){return;
}GroupEdit.bulkOpSource=$(a?"members_out":"members_in");GroupEdit.bulkOpStart();};GroupEdit.bulkOpStart=function(){$("add_all").disabled=true;
$("remove_all").disabled=true;GroupEdit.sortables.detach();GroupEdit.bulkOp();};GroupEdit.bulkOpEnd=function(){$("add_all").disabled=false;
$("remove_all").disabled=false;GroupEdit.sortables.attach();delete GroupEdit.bulkOpSource;};GroupEdit.bulkOp=function(){var a=GroupEdit.bulkOpSource.getElement(".member");
if(a){GroupEdit.onDoubleClick(a);}else{GroupEdit.bulkOpEnd();}};var DataMaintenance={};DataMaintenance.onInit=function(){Locale.use("en-GB");
new Picker.Date($$("input[type=text]"),{timePicker:false,positionOffset:{x:5,y:0},pickerClass:"picker",blockKeydown:false});
setAjaxJsonForm("purge_istats_form",DataMaintenance.validateImageStatsPurge,DataMaintenance.onTaskSubmit,DataMaintenance.onTaskSuccess,DataMaintenance.onTaskError);
setAjaxJsonForm("purge_sstats_form",DataMaintenance.validateSystemStatsPurge,DataMaintenance.onTaskSubmit,DataMaintenance.onTaskSuccess,DataMaintenance.onTaskError);
setAjaxJsonForm("purge_data_form",DataMaintenance.validateDataPurge,DataMaintenance.onTaskSubmit,DataMaintenance.onTaskSuccess,DataMaintenance.onTaskError);
addEventEx("folder_select_button","click",DataMaintenance.onFolderSelectClick);window.onFolderSelected=function(a){DataMaintenance.onFolderSelected(a);
};};DataMaintenance.validateImageStatsPurge=function(){return DataMaintenance.validateDate($("purge_istats_text"),$("purge_istats_date"));
};DataMaintenance.validateSystemStatsPurge=function(){return DataMaintenance.validateDate($("purge_sstats_text"),$("purge_sstats_date"));
};DataMaintenance.validateDate=function(c,b){var a=Date.parse(c.value);if(!a||!a.isValid()){setTimeout(function(){c.focus();
c.select();},10);return false;}if(!confirm("Are you sure you want to purge statistics up to "+c.value+" ?")){return false;
}b.value=a.toISOString();return true;};DataMaintenance.validateDataPurge=function(){var a=$("purge_folder_text").innerHTML;
return confirm("Are you sure you want to purge deleted data in "+a+" and sub-folders?");};DataMaintenance.onFolderSelectClick=function(){popup_iframe($("folder_browse_url").value,575,500);
};DataMaintenance.onFolderSelected=function(a){$("purge_folder_text").innerHTML=a;$("purge_folder_path").value=a;
};DataMaintenance.onTaskSubmit=function(){DataMaintenance.disableButtons();};DataMaintenance.onTaskError=function(a,c){DataMaintenance.enableButtons();
var b=getAPIError(a,c);if(b.status==APICodes.ALREADY_EXISTS){alert("This task is already running.");}else{alert("The task could not be started.\n\n"+b.message);
}};DataMaintenance.onTaskSuccess=function(){DataMaintenance.enableButtons();alert("The task has been successfully started.");
};DataMaintenance.enableButtons=function(){$$('input[type="submit"]').each(function(a){a.disabled=false;
});};DataMaintenance.disableButtons=function(){$$('input[type="submit"]').each(function(a){a.disabled=true;
});};var FolderPermissions={};FolderPermissions.onInit=function(){setAjaxJsonForm("editform",FolderPermissions.onFormValidate,FolderPermissions.onFormSubmit,FolderPermissions.onFormSuccess,FolderPermissions.onFormError);
setAjaxJsonForm("deleteform",null,FolderPermissions.onFormSubmit,FolderPermissions.onFormSuccess,FolderPermissions.onFormError);
addEventEx("folder_select_button","click",FolderPermissions.onFolderSelectClick);window.onFolderSelected=function(a){FolderPermissions.onFolderSelected(a);
};addEventEx("select_group_id","change",FolderPermissions.onGroupSelected);addEventEx("edit_perms","click",FolderPermissions.onEditClick);
popup_convert_anchor("trace_permissions",575,650);if($("permissions_edit_container")){FolderPermissions.editSlide=new Fx.Slide("permissions_edit_container").hide();
$("permissions_edit_container").setStyle("visibility","visible");}};FolderPermissions.onEditClick=function(){FolderPermissions.editSlide.toggle();
return false;};FolderPermissions.onFolderSelectClick=function(){popup_iframe($("folder_browse_url").value,575,500);
};FolderPermissions.onFolderSelected=function(c){var b=$("permissions_url").value,a=$("view_group_id").value;
FolderPermissions.setLoadingMessage("Please wait...");window.location=b+"?path="+encodeURIComponent(c)+"&group="+a;
};FolderPermissions.onGroupSelected=function(){var c=$("permissions_url").value,a=$("view_folder_path").value,d=$("select_group_id"),b=d.options[d.selectedIndex].value;
FolderPermissions.setLoadingMessage("Please wait...");window.location=c+"?path="+encodeURIComponent(a)+"&group="+b;
};FolderPermissions.setLoadingMessage=function(a){$("permissions_edit_container").slide("hide");$("permissions_current_container").innerHTML=a;
};FolderPermissions.onFormValidate=function(){var b=$("old_access").value,c=$("view_permission_id").value,d=$("access"),a=d.options[d.selectedIndex].value;
return(c=="")||(a!=b);};FolderPermissions.onFormSubmit=function(){DataMaintenance.disableButtons();};
FolderPermissions.onFormSuccess=function(){DataMaintenance.enableButtons();window.location.reload();};
FolderPermissions.onFormError=function(a,c){DataMaintenance.enableButtons();var b=getAPIError(a,c);alert("Sorry, your changes were not saved.\n\n"+b.message);
};var TracePermissions={};TracePermissions.onInit=function(){GenericPopup.initButtons();addEventEx("select_user_id","change",TracePermissions.onUserSelected);
};TracePermissions.onUserSelected=function(){var b=$("trace_url").value,c=$("select_user_id"),a=c.options[c.selectedIndex].value;
TracePermissions.setLoadingMessage("Please wait...");window.location=b+"&user="+a;};TracePermissions.setLoadingMessage=function(a){$("trace_container").innerHTML=a;
};function submitParentForm(d){var e=d.getParent();if(e&&(e.tagName.toLowerCase()=="form")){var c=e.retrieve("events");
if(c&&c.submit){var b=c.submit.keys;for(var a=0;a<b.length;a++){if(b[a]()===false){return false;}}}e.submit();
}return false;}function onInit(){switch($(document.body).id){case"user_list":UserList.onInit();break;
case"user_edit":UserEdit.onInit();break;case"group_list":GroupList.onInit();break;case"group_edit":GroupEdit.onInit();
break;case"data_maintenance":DataMaintenance.onInit();break;case"folder_permissions":FolderPermissions.onInit();
break;case"trace_permissions":TracePermissions.onInit();break;}}window.addEvent("domready",onInit);