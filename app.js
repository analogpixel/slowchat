// https://github.com/tsironis/lockr

var user_data;
var user_contacts = [];
var current_selected;
Lockr.prefix = 'lockr_';
const qrScanner = new QrScanner(document.getElementById('vid'), result => process_message(result));

function process_message(m) {
  qrScanner.stop();
  $("#inputImage").modal('toggle');
  console.log("GOT MESSAGE:", m);
}

function start_scan() {
  qrScanner.start();
}

function load_data() {
  user_data = Lockr.get('user_data')
  user_contacts = Lockr.get('user_contacts')
}

function save_data() {
  Lockr.set('user_data', user_data);
  Lockr.set('user_contacts', user_contacts);
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
  a = `<div id="${name_to_id(u.first_name)}" onClick="update_person(this)" class="person"><div class="person-name">${u.first_name}</div><div class="person-date">${u.last}</div></div>`
  $("#contact_list").append(a);
}

function print_message() {
  new QRCode(document.getElementById("qrcode"), {
      text: "m:this is the text",
      width: 800,
      height: 800,
      correctLevel : QRCode.CorrectLevel.L
  });

  window.print();
}

// Save the user data to local storage
document.getElementById("save_user_data").addEventListener("click", function() {

  user = {'first_name': $("#first_name_input").val(),
          'last_name':  $("#last_name_input").val(),
          'user_address': $("#user_address").val(),
          'user_city': $("#user_city").val(),
          'user_state': $("#user_state").val(),
          'user_zip': $("#user_zip").val()
          };

  console.log("write user:", user);

  user_contacts.push(user);
  save_data(); // save the data to disk
  update_ui(); // update the ui
  $("#newUser").modal('toggle');
}); 

load_data();
update_ui();
