Poem = new Mongo.Collection("poem");
PoemHistory = new Mongo.Collection("poemHistory");

function updateHistory() {
        var oldPoem = Poem.findOne({is_online: true});
        oldPoem.time = new Date();
        delete oldPoem._id;
        PoemHistory.insert(oldPoem);
}

Meteor.methods({
    updateWord: function (newWord) {
        updateHistory();

        p = Poem.findOne();
        var nw = p.words;

        for (var i = 0; i < nw.length; ++i) {
            if (nw[i].lastWord) {
                delete nw[i].lastWord;
            }

            if(nw[i].pos == newWord.pos) {
                nw[i] = newWord;
            }
        }
        p.words = nw;

        Poem.update({is_online: true}, p);
    },
    insertWord: function (word, position) {
        updateHistory();

        p = Poem.findOne();
        var nw = p.words;

        for (var i = 0; i < nw.length; ++i) {
            if(nw[i].pos >= position) {
                nw[i].pos += 1;
            }

            if (nw[i].lastWord) {
                delete nw[i].lastWord;
            }
        }

        nw.push({"word": word, "pos": position, "lastWord": true});
        p.words = nw;
        Poem.update({is_online: true}, p);
    },
    removeWord: function (position) {
        updateHistory();

        p = Poem.findOne({is_online: true});
        var nw = p.words.filter(function (x) { return x.pos != position; });

        for (var i = 0; i < nw.length; ++i) {
            if(nw[i].pos > position) {
                nw[i].pos -= 1;
            }

            if (nw[i].lastWord) {
                delete nw[i].lastWord;
            }
        }

        p.words = nw;
        Poem.update({is_online: true}, p);
    },
    insertLineBreak: function (position) {
        updateHistory();

        p = Poem.findOne({is_online: true});
        var nw = p.words;

        for (var i = 0; i < nw.length; ++i) {
            if(nw[i].pos >= position) {
                nw[i].pos += 1;
            }

            if (nw[i].lastWord) {
                delete nw[i].lastWord;
            }
        }

        nw.push({"lineBreak": true, "pos": position, "lastWord": true});
        p.words = nw;
        Poem.update({is_online: true}, p);
    }

});

Router.route('/poem', function () {
  poem = Poem.findOne({is_online: true});

  this.render('poem');

});

Router.route('/poemHistory', function () {
  poemHistory = PoemHistory.find();
  poemVisible = 0;
  numPoems = poemHistory.count() + 1;

  this.render('poemHistory');

});


if (Meteor.isClient) {
    var editPosition = 0;

    Template.poemHistory.helpers({
        'poems': function () {
            return getPoemHistory();
        }
    });

    Template.poemVersion.rendered = function () {
        if (this.data.pos != poemVisible) {
            this.$(".poem").hide();
        }
    }

    Template.body.events({
        'keydown': function (event) {
            console.log(numPoems);
            if (event.which == 39) {
                visiblePoem = $("#poem-" + poemVisible);
                visiblePoem.toggle(0);
                poemVisible = (poemVisible + 1) % numPoems;
                $("#poem-" + poemVisible).toggle(0);

            }
        }
    });

    Template.poem.helpers({
        'poem': function () {
            return poemContent();
        },
        'editPosition': function() {
            return editPosition;
        }
    })

    Template.poem.events({
       'click .word-text': function (event) {
          Session.set("editWord", this.pos);
          $(".hidden-word").text(this.word);
          var wordDOM = $(event.currentTarget);
          var wordEditDOM = wordDOM.next();
          wordDOM.toggle();
          wordEditDOM.toggle();
          console.log($('.hidden-word').width());
          $("input", wordEditDOM).css('width', $('.hidden-word').width() + 20);
          $("input", wordEditDOM).focus();
      },
      'keypress .word-input': function (event) {
          if (event.which == 13 || event.which == 32) {
              newWord = $(event.target).val();
              if (newWord == '') {
                  Meteor.call("removeWord", this.pos);
              } else {
                  this.word = newWord;
                  var upword = {'word': newWord, 'pos': this.pos, 'lastWord': true};
                  Meteor.call("updateWord", upword);
                  if (event.which == 32) {
                      Meteor.call("insertWord", "", this.pos + 1);
                      Session.set("editWord", this.pos + 1);
                      return;
                  }
              }
              Session.set("editWord", 0);
          }
      },
      'click .space': function (event) {
          Session.set("editWord", this.pos);
          Meteor.call("insertWord", "", this.pos)
      },
      'click .line-break': function (event) {
          Meteor.call("insertLineBreak", this.pos);
          Meteor.call("insertWord", "", this.pos + 1);
          Session.set("editWord", this.pos + 1);
      }
    });

    Template.wordEdit.rendered = function () {
        this.$("input").css('width', $(".hidden-word").width() + 20);
        this.$("input").focus();
    }

    Template.wordEdit.events({
        'keyup input': function (event) {
            $(".hidden-word").text($(event.currentTarget).val());
            $(event.currentTarget).animate({'width': $(".hidden-word").width() + 20}, 100);
        },
    });

    Template.word.helpers({
        wordText: function () {
          return this.word;
        },
        editMode: function () {
          return this.pos == Session.get("editWord");
        }
    });

    function poemContent() {
        pw = Poem.findOne({is_online: true}).words.sort(function (a,b) { return a.pos - b.pos; });
        return pw;
    }

    function getPoemHistory() {
        var poems = PoemHistory.find();
        poems = poems.fetch();
        poems = poems.map(function (x) {
            x.words.sort(function (a,b) { return a.pos - b.pos; });
            return x;
        });

        poems.sort(function (a,b) { return a.time - b.time; });

        var lastPoem = Poem.findOne({is_online: true});
        lastPoem.words.sort(function (a,b) { return a.pos - b.pos; });

        poems.push(lastPoem);

        var idx_poems = poems.map(function (x, i) {
                            x.pos = i;
                            if (i > 0) {
                                x.hidden = true;
                            } return x; });


        return idx_poems;
    }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
