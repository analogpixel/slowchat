// https://github.com/tsironis/lockr

var user_data;
var user_contacts = [{'name':'matt', 'last':'12/12/2020'}, {'name':'jane', 'last':'12/12/2020'}];
var current_selected;
Lockr.prefix = 'lockr_';


function load_data() {
  user_data = Lockr.get('user_data')
  user_contacts = Lockr.get('user_contacts')
}

function save_data() {
  Locker.set('user_data', user_data);
  Locker.set('user_contacts', user_contacts);
}

function update_ui() {
   $("#contact_list").html("");
   user_contacts.forEach( c => { add_user_ui(c); });
}

function name_to_id(n) {
  return "person_" + n.toLowerCase().replaceAll(" ","_");
}

function update_person(u) {
  $(".selected").removeClass('selected');
  $("#" + u.id).toggleClass("selected");
  current_selected = u.id;
  update_message_pane();
}

/*
update the message page with the current_selected user
*/
function update_message_pane() {

}

/*
add a user to the contact list
*/
function add_user_ui(u) {
  a = `<div id="${name_to_id(u.name)}" onClick="update_person(this)" class="person"><div class="person-name">${u.name}</div><div class="person-date">${u.last}</div></div>`
  $("#contact_list").append(a);
}

update_ui();
