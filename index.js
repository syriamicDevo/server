const login = require('fca-unofficial')
const express = require('express')
const app = express()
const fs = require('fs')
const appState = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'))
function confess(message, from, to, event, api){
  let count = parseInt(fs.readFileSync(__dirname +'/count','utf8'))|| 0
  const { threadID, messageID, senderID } = event;
  count += 1
  fs.writeFileSync('count', count.toString())
  const text = message
  const sender = from
  const receiver = to
    const uuid = getGUID();
  const formData = {
    "input": {
      "composer_entry_point": "inline_composer",
      "composer_source_surface": "timeline",
      "idempotence_token": uuid + "_FEED",
      "source": "WWW",
      "attachments": [],
      "audience": {
        "privacy": {
          "allow": [],
          "base_state": "EVERYONE", // SELF EVERYONE
          "deny": [],
          "tag_expansion_state": "UNSPECIFIED"
        }
      },
      "message": {
        "ranges": [],
        "text": `󰟫╭ Confession Post #${count}
\nજ⁀➴: ${receiver}\n\n󰥴 : ${message}\n\n
⁀: ${sender}
━━━━━━━━━━━━━━━━━━━━━`
      },
      "with_tags_ids": [],
      "inline_activities": [],
      "explicit_place_id": "0",
      "text_format_preset_id": "0",
      "logging": {
        "composer_session_id": uuid
      },
      "tracking": [
        null
      ],
      "actor_id": api.getCurrentUserID(),
      "client_mutation_id": Math.floor(Math.random()*17)
    },
    "displayCommentsFeedbackContext": null,
    "displayCommentsContextEnableComment": null,
    "displayCommentsContextIsAdPreview": null,
    "displayCommentsContextIsAggregatedShare": null,
    "displayCommentsContextIsStorySet": null,
    "feedLocation": "TIMELINE",
    "feedbackSource": 0,
    "focusCommentID": null,
    "gridMediaWidth": 230,
    "groupID": null,
    "scale": 3,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "renderLocation": "timeline",
    "useDefaultActor": false,
    "inviteShortLinkKey": null,
    "isFeed": false,
    "isFundraiser": false,
    "isFunFactPost": false,
    "isGroup": false,
    "isTimeline": true,
    "isSocialLearning": false,
    "isPageNewsFeed": false,
    "isProfileReviews": false,
    "isWorkSharedDraft": false,
    "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
    "hashtag": null,
    "canUserManageOffers": false
  };
  try {
    const results = createPost(api, formData)
    return api.sendMessage(`𝐏𝐨𝐬𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n𝙿𝚘𝚜𝚝: ${results})`, event.senderID)
  } catch (e) {
    api.sendMessage(e, event.senderID)
  }

}
async function createPost(api, formData) {
  return new Promise((resolve, reject) => {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "7711610262190099",
      variables: JSON.stringify(formData)
    };

    api.httpPost('https://www.facebook.com/api/graphql/', form, (error, result) => {
      if (error) {
        reject(error);
      } else {
        try {
          const responseData = JSON.parse(result.replace("for (;;);", ""));
          const postID = responseData.data.story_create.story.legacy_story_hideable_id;
          const postURL = responseData.data.story_create.story.url;
          resolve({ postID, postURL });
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

function getGUID() {
  var sectionLength = Date.now();
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
    return _guid;
  });
  return id;
}
app.get('/', (req, res) => {
  res.send("Hello;)")
})
app.listen(process.env.PORT)
login({appState}, (err, api) => {
  if (err) return;
  api.listenMqtt((err, event) => {
    if (err) return;
    if (event.body) {
      const args = event.body.split(/ +/)
      if (event.body.startsWith("confess")) {
        if (!args[1] || !args[2] || !args[3]) {
          api.sendMessage("Error Usage.\nconfess <message> <from> <to>", event.senderID, event.messageID)
        } else {
          confess(args[1], args[2], args[3], event, api)
        
        }
      }
    }
  })
})