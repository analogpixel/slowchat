// https://github.com/tsironis/lockr

var user_data;
var user_contacts = [];
var current_selected;
var scan_type = "none"; 
Lockr.prefix = 'lockr_';
const qrScanner_message = new QrScanner(document.getElementById('vid_message'), result => process_message(result));
const qrScanner_contact = new QrScanner(document.getElementById('vid_contact'), result => process_message(result));

function process_message(m) {

  console.log("GOT MESSAGE:", m, scan_type);
  [mtype, message] = m.split('|');

  if ( mtype == "m" && scan_type == "message") {
    qrScanner_message.stop();
    $("#inputImage").modal('toggle');

    if (! (current_selected in user_data)) {
      user_data[current_selected] = {'messages': []}
    }
    user_data[current_selected]['messages'].push("1|" + message);
    save_data();
    update_message_pane(current_selected);
    console.log("scanned in message");
  }

  if ( mtype == "c" && scan_type == "contact") {
    qrScanner_contact.stop();
    console.log("Got contact:", message);
    $("#inputQrContactModal").modal('toggle');
    var data = message.split(">");

    user = {'first_name': data[0],
      'last_name':  data[1],
      'user_address': data[2],
      'user_city': data[3],
      'user_state': data[4],
      'user_zip': data[5]
    };

    user_contacts.push(user);
    save_data(); // save the data to disk
    update_ui(); // update the ui
    $("#inputQrContact").modal('toggle');

    console.log("scanned in contact");
  }
}

function start_scan() {
  scan_type="message";
  qrScanner_message.start();
}

function start_contact_scan() {
  scan_type="contact";
  qrScanner_contact.start();
}

function load_data() {
  user_data = Lockr.get('user_data')
  user_contacts = Lockr.get('user_contacts')

  if (user_data == undefined ) {
    user_data = {};
    $("#welcome").modal('toggle'); // no data? welcome the user
  }

  if (user_contacts == undefined) {
    user_contacts = [];
  }

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
  $(".message-ui").show();
  $(".selected").removeClass('selected');
  $("#" + u.id).toggleClass("selected");
  current_selected = u.id;
  update_message_pane(u.id);
}

/*
update the message page with the current_selected user
*/
function update_message_pane(user) {


  cdata = get_contact(user) ;

  html = `<table class="message-table">`;
  if (user in user_data) {
    user_data[user]['messages'].forEach( (m) => {
      [u,mes]  = m.split("|");
      if (u == '0') { u = "You"; } else { u=cdata.first_name; }
      // html += `<div class="row ml-10 pt-3 gy-5" >
      html += `<tr class="message-table-row">
          <td class=s1><div class="message-bubble" p-3>${mes}</div></td>
          <td class=s2><div class="message-sender text-center">${u}</td>
          </tr>`
    });

  }
  html += `</table>`
  $("#message_container").html(html);
  $("#message_container").scrollTop($('#message_container')[0].scrollHeight);
}

/*
add a user to the contact list
*/
function add_user_ui(u) {
  //a = `<div id="${name_to_id(u.first_name)}" onClick="update_person(this)" class="person"><div class="person-name">${u.first_name}</div><div class="person-date">${u.last}</div></div>`
  a = `<div id="${name_to_id(u.first_name + u.last_name)}" onClick="update_person(this)" class="person"><div class="person-name">${u.first_name}</div><div class=person-lastname>${u.last_name}</div></div>`
  $("#contact_list").append(a);
}

function send_message() {
  var message = $("#message_text").val();
  var to   = current_selected;

  if (! (to in user_data)) {
    user_data[to] = { 'messages': [] }
  }

  user_data[to]['messages'].push(`0|${message}`) ;

  save_data();
  update_message_pane(to);
  print_message("me", to, message);
}

function get_contact(name) {
  var ret = undefined;

  user_contacts.forEach( (c) => {
    if ( name_to_id(c.first_name + c.last_name ) == name) {
      ret = c;
    }
  })  ;
  return ret;
}

function print_message(from,to, message) {
  $("#qrcode").html("");
  new QRCode(document.getElementById("qrcode"), {
    text: "m|" + message,
    width: 600,
    height: 600,
    correctLevel : QRCode.CorrectLevel.L
  });

  if (user_data != undefined && user_data['settings'] != undefined) {
    contact = `${user_data['settings']['first_name']}>${user_data['settings']['last_name']}>${user_data['settings']['user_address']}>${user_data['settings']['user_city']}>${user_data['settings']['user_state']}>${user_data['settings']['user_zip']}`

    $("#contact_info").html( contact);

    $("#qrcode_contact").html("");
    new QRCode(document.getElementById("qrcode_contact"), {
      text: "c|" + contact,
      width: 300,
      height: 300,
      correctLevel : QRCode.CorrectLevel.L
    });
  } else {
    $("#contact_info").html("<h2>Please go into settings and setup your contact info so the remote person is able to scan in your address for a return message</h2>");
  }


  var contact_data = get_contact(to);
  send_to = `${contact_data['first_name']} ${contact_data['last_name']}<br>
             ${contact_data['user_address']} <br>
             ${contact_data['user_city']} ${contact_data['user_state']} , ${contact_data['user_zip']}<br>`

  $("#send-to").html(send_to);

  window.print();
}

// Save settings 
document.getElementById("save_settings").addEventListener("click", function() {
  settings = {'first_name': $("#settings_first_name_input").val(),
    'last_name':  $("#settings_last_name_input").val(),
    'user_address': $("#settings_user_address").val(),
    'user_city': $("#settings_user_city").val(),
    'user_state': $("#settings_user_state").val(),
    'user_zip': $("#settings_user_zip").val()
  };

  if ( user_data == undefined) {
    user_data = {}
  }

  user_data['settings'] = settings;
  save_data(); // save the data to disk
  $("#settings").modal('toggle');
});

// Save the user data to local storage
document.getElementById("save_user_data").addEventListener("click", function() {

  user = {'first_name': $("#first_name_input").val(),
    'last_name':  $("#last_name_input").val(),
    'user_address': $("#user_address").val(),
    'user_city': $("#user_city").val(),
    'user_state': $("#user_state").val(),
    'user_zip': $("#user_zip").val()
  };


  user_contacts.push(user);
  save_data(); // save the data to disk
  update_ui(); // update the ui
  $("#newUser").modal('toggle');
}); 


$(".message-ui").hide();
load_data();
update_ui();
