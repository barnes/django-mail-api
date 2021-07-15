document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email(event){
  event.preventDefault();
  console.log(document.querySelector('#compose-recipients').value)
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('inbox')
  });
  
}

function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#submit').addEventListener('click', send_email);

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    emails.forEach(email => {
      console.log(email)
      const element = document.createElement('div');
      element.style.border = '1px solid black';
      element.style.margin = '5px';
      element.style.padding = '5px';
      element.style.cursor = 'pointer';
      if(email.read){
        element.style.background = '#F0FFFF';
      }
      else {
        element.style.background = 'white';
      }
      element.innerHTML = `
      <b>${email.sender}</b> &emsp; ${email.subject} <p style="float:right">${email.timestamp}</p>
      `;
      element.addEventListener('click', function(){
        console.log(email.subject + " has been clicked")
        view_email(email.id)
      })
      document.querySelector('#emails-view').append(element)
    })

    // ... do something else with emails ...
  });

}

function view_email(email_id){
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#email-view').innerHTML = `<h3>Single Email View</h3>`;

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      if(email.archived){
        archive = "Unarchive"
      }
      else {
        archive = "Archive"
      }
      
      document.querySelector('#email-view').innerHTML = `
        <p><b>FROM: </b> ${email.sender}</p>
        <p><b>TO: </b> ${email.recipients}</p>
        <p><b>Subject: </b> ${email.subject}</p>
        <p><b>Timestamp: </b> ${email.timestamp}</p>
        <button id="reply" class="btn btn-primary"> Reply </button>
        <button id="archive" class="btn btn-primary">${archive} </button>
        <hr>
        <p>${email.body}</p>
        `;

        document.querySelector('#archive').addEventListener('click', () =>{
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
          load_mailbox('inbox')
        });

      // ... do something else with email ...
  });

  
}