function doGet(e) {
  return ContentService.createTextOutput('');
}

function doPost(e) {
  if (e.parameter.command === '/未回答チェック') {
    handleSlashCommand(e);
  }
  return ContentService.createTextOutput('');
}

function handleSlashCommand(e) {
  var threadLink = e.parameter.text;
  var threadInfo = getThreadInfo(threadLink);
  var reactionsByUser = analyzeReactions(threadInfo);
  postResultsToChannel(reactionsByUser);
}

function postResultsToChannel(reactionsByUser) {
  var message = 'リアクションを行った人:\n';
  for (var user in reactionsByUser) {
    message += '- <@' + user + '>: ' + reactionsByUser[user] + '\n';
  }
  // TODO: Slack APIを使用してチャンネルにメッセージを投稿する
}

function analyzeReactions(threadInfo) {
  var reactionsByUser = {};
  var messages = threadInfo.messages;
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    if (message.reactions) {
      var user = message.user;
      if (user in reactionsByUser) {
        reactionsByUser[user]++;
      } else {
        reactionsByUser[user] = 1;
      }
    }
  }
  return reactionsByUser;
}

function getThreadInfo(threadLink) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_API_TOKEN');
  var parts = threadLink.split('/');
  var channel = parts[4];
  var ts = parts[6];
  var apiUrl = 'https://slack.com/api/conversations.replies?channel=' + channel + '&ts=' + ts;
  var response = UrlFetchApp.fetch(apiUrl, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
  return JSON.parse(response.getContentText());
}