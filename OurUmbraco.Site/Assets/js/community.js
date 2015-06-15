﻿var community = function () {
    return {
        /* FORUM */
        markCommentAsSolution: function (id) {
            $.get("/umbraco/api/Powers/Action/?alias=TopicSolved&pageId=" + id);
        },

        highFiveComment: function (id) {
            $.get("/umbraco/api/Powers/Action/?alias=LikeComment&pageId=" + id);
        },

        voteProject: function (id) {
            $.get("/umbraco/api/Powers/Action/?alias=ProjectUp&pageId=" + id);
        },

        deleteComment: function (id, thisComment) {

            $.ajax({
                url: "/umbraco/api/Forum/Comment/" + id,
                type: "DELETE"
            });            
        },

        deleteThread: function (id) {
            $.ajax({
                url: "/umbraco/api/Topic/Delete/" + id,
                type: "DELETE"
            })
            .done(function () {
                window.location = "/forum";
            });
        },

        getCommentMarkdown: function (id) {
            return $.get("/umbraco/api/Forum/CommentMarkDown/" + id).pipe(function (p) {
                return p;
            });
            
        },

        getThreadMarkdown: function (id) {
            return $.get("/umbraco/api/Forum/TopicMarkDown/" + id).pipe(function (p) {
                return p;
            });

        },
        follow: function (id,controller) {
            $.get("/umbraco/api/Notifications/SubscribeToForum"+controller+"/?id=" + id);
        },

        unfollow: function (id,controller) {
            $.get("/umbraco/api/Notifications/UnSubscribeFromForum"+controller+"/?id=" + id);
        },

        markAsSpam: function (id,controller) {
            $.post("/umbraco/api/Forum/"+controller+"AsSpam/" + id);
        },

        markAsHam: function (id,controller) {
            $.post("/umbraco/api/Forum/"+controller+"AsHam/" + id);
        },

        getCategoryUrl: function (id) {
            return $.get("/umbraco/api/PublicForum/CategoryUrl/" + id).pipe(function (p) {
                return p;
            });
        },

        removeContributor: function (projectId, memberId) {
            $.ajax({
                url: "/umbraco/api/ProjectContribution/DeleteContributor/?projectId=" + projectId + "&memberId=" + memberId,
                type: "DELETE"
            });
        },

        updateCollaborationStatus: function(projectId, status) {
            $.ajax({
                url: "/umbraco/api/ProjectContribution/UpdateCollaborationStatus/?projectId=" + projectId + "&status=" + status,
                type: "PUT"
            });
        },

        addContributor: function(projectId, email)
        {
            return $.get("/umbraco/api/ProjectContribution/AddContributor/?projectId=" + projectId + "&email=" + email).pipe(function (p) {
                return p;
            });
        },

        removeProjectForum: function(forumId) {
            $.ajax({
                url: "/umbraco/api/ProjectForum/DeleteProjectForum/?forumId=" + forumId,
                type: "DELETE"
            });
        },

        addProjectForum: function(title, description, parentId) {
            $.post("/umbraco/api/ProjectForum/PostProjectForum/", { title: title, description: description, parentId: parentId }, function (data) {
                $("#forums").append("<li>" + data.title + "<small>" + data.description + "</small><a data-id=\"" + data.forumId + "\" class=\"remove-forum\" href=\"#\"><i class=\"icon-Delete-key\"></i>Remove</a></li>");

                $("#forum-title").val("");
                $("#forum-description").val("");
            });
        }

    };
}();


$(function () {
    /*FORUM*/

    //Mark as solution
    $(".comments").on("click","a.solved",function (e) {
        e.preventDefault();
        var data = $(this).data();
        var id = parseInt(data.id);
        community.markCommentAsSolution(id);
        $(this).closest(".comment").addClass('solution');
        $(".comment a.solved").remove();

    });

    //Copy link
    var deepLinking = false;
    var getLink = $(".getLink");
    var body = $("body");
    var thankYou = $("#thankYou");

    $(".comments").on("click", "a.copy-link", function (e) {
        e.preventDefault();
        if (deepLinking === false) {
            body.addClass("active copy-prompt");
            getLink.val(window.location.hostname + window.location.pathname + $(this).attr("data-id"));
            getLink.focus().select();
            deepLinking = true;
        } else {
            body.removeClass("active copy-prompt");
            deepLinking = false;
        }
    });

    getLink.keydown(function (e) {
        if ((e.metaKey || e.ctrlKey) && e.keyCode === 67) {
            body.removeClass("active copy-prompt");

            thankyou.style.opacity = 1;
            setTimeout(function () {
                thankyou.style.opacity = 0;
            }, 900);
            deepLinking = false;
        }
    });

    $(".overlay").on("click", function () {
        body.removeClass("active copy-prompt");
        deepLinking = false;
    });



    //High five
    $(".comment .highfive a").on("click",function (e) {
        e.preventDefault();
        var data = $(this).data();
        var id = parseInt(data.id);
        community.highFiveComment(id);
        $(this).empty();
        var cont = $(this).parent();
        cont.append("You Rock!");
        var count = parseInt($(".highfive-count", cont).html());
        count++;
        $(".highfive-count", cont).html(count);
    });

    //Vote project
    $("#projectVote").one("click", function (e) {
        e.preventDefault();
        $("#projectVote").click(function () { return false; });
        var data = $(this).data();
        var id = parseInt(data.id);
        community.voteProject(id);
        var votes = $("#projectVote").html().replace(" votes", "");
        console.log(votes);
        var count = parseInt(votes);
        
        count++;
        $("#projectVote").html(count + " votes");
        $("#projectVote").after("<br /><span>&nbsp;&nbsp;&nbsp;You Rock!</span>");
    });

    //Delete comment
    $(".comments").on("click", "a.delete-reply", function (e) {
        e.preventDefault();

        var data = $(this).data();
        var id = parseInt(data.id);
        var $thisComment = $(this).closest(".comment");

        terminateConfirm("comment", id, $thisComment);
    });

    // Delete thread

    $(".delete-thread").on("click", function (e) {
        e.preventDefault();

        var data = $(this).data();
        var id = parseInt(data.id);

        terminateConfirm("thread", id);
    });

    // Ask for confirmation
    function terminateConfirm(typeOfPost, id, thisComment) {
        var $confirm = $("#confirm-wrapper");
        var $confirmType = $("#confirm-wrapper .type-of");
        var $body = $("body");

        $body.addClass("active confirm-prompt");

        $confirmType.html(typeOfPost);

        $("#confirm-wrapper .green").on("click", function () {
            terminatePost(typeOfPost, id, thisComment);
            $body.removeClass("active confirm-prompt");
        });

        $("#confirm-wrapper .red").on("click", function () {
            $body.removeClass("active confirm-prompt");
        });
    }

    // Terminate upon confirmation
    function terminatePost(typeOfPost, id, thisComment) {
        switch (typeOfPost) {
            case "comment":
                thisComment.closest(".comment").fadeOut(function () { thisComment.closest(".comment").remove(); });
                community.deleteComment(id, thisComment);
                break;
            case "thread":
                community.deleteThread(id);
                break;
            default:
                alert("Something went wrong");
        }
    }
    
    //follow thread

    //unfollow thread
    $(".forum-overview .follow").on("click", function (e) {
        e.preventDefault();
        var data = $(this).data();
        var id = parseInt(data.id);
        var controller = data.controller;
        if ($(this).hasClass("following")) {

            community.unfollow(id,controller);
            $(this).removeClass("following");
            $(this).addClass("transparent");
            $("span", $(this)).text("Follow");
        }
        else
        {
            community.follow(id,controller);
            $(this).addClass("following");
            $(this).removeClass("transparent");
            $("span", $(this)).text("Following");
        }
    });

    //Category filter
    $(".sorting select").on("change", function () {
        var id = $(this).val();
        community.getCategoryUrl(id).done(function (data) {
            window.location.replace(data);
           
        });;
    });

    //mark as spam

    $(".comments").on("click", "a.mark-as-spam", function (e) {
        e.preventDefault();
        var data = $(this).data();
        var id = parseInt(data.id);
        var controller = data.controller;
        if (confirm("Are you sure you want to mark this as spam?")) {
            community.markAsSpam(id, controller);

            $(this).removeClass("mark-as-spam");
            $(this).addClass("mark-as-ham");

            $("span", $(this)).text("Mark as ham");
        } 
    });

    //mark as ham
    $(".comments").on("click", "a.mark-as-ham", function (e) {
        e.preventDefault();
        var data = $(this).data();
        var id = parseInt(data.id);
        var controller = data.controller;

        community.markAsHam(id, controller);

        $(this).removeClass("mark-as-ham");
        $(this).addClass("mark-as-spam");

        $("span", $(this)).text("Mark as spam");
    });


    /* PROFILE */

    //upload avatar
    $(".profile-settings-forms").on("click", ".avatar-image", function(e)
    {
        var $body = $("body");
        var $dialog = $("#update-avatar-dialog");
        var $loader = $(".span", $dialog);
        var $file = $("input[type=file]", $dialog);
        var $cancel = $("button", $dialog);
       
        var uploadStart = function () {
            $loader.show();
            $file.hide();
        };

        var uploadComplete = function (response) {
            
            $loader.hide();
            $file.show();

            if (response.success) {                
                $("img", $(".profile-settings-forms")).attr("src", response.imagePath + "?width=100&height=100&mode=crop");
                $("#Avatar", $(".profile-settings-forms")).val(response.imagePath);
                $body.removeClass("active uploading-image");
            } else {
                $dialog.addClass("invalid");
                setTimeout(function () { $dialog.removeClass("invalid") }, 3000);
                $file.val("");
            }
        };

        $file.unbind("change").ajaxfileupload({
            action: $file.attr("data-action"),
            onStart: uploadStart,
            onComplete: uploadComplete
        });

        $cancel.click(function () {
            $body.removeClass("active uploading-image");
            
        });
        $body.addClass("active uploading-image");
    });

    //password repeat
    $(".profile-settings-forms #password input").focus(function (e) {
        $(".profile-settings-forms #repeat-password").show();
    });

    /* profile form */

    //make sure surrounding element get's warning class
    $(".profile-settings-forms form").submit(function () {
        
        if ($(this).valid()) {
            $(this).find("div.profile-input").each(function () {
                if ($(this).find(".input-validation-error").length === 0) {
                    $(this).removeClass("warning");
                }
            });
        }
        else {
            $(this).find("div.profile-input").each(function () {
                if ($(this).find(".input-validation-error").length > 0) {
                    $(this).addClass("warning");
                }
            });
        }
    });

    $(".profile-settings-forms form").each(function () {
        $(this).find("div.profile-input").each(function () {
            if ($(this).find(".input-validation-error").length > 0) {
                $(this).addClass("warning");
            }
        });
    });

    /* profile notifications */
    $(".profile-settings .unfollow").on("click", function (e) {
        e.preventDefault();
        var data = $(this).data();
        var id = parseInt(data.id);
        var controller = data.controller;
        community.unfollow(id, controller);
        $(this).parent("li").fadeOut();
    });

    /* profile project contribution */
    $(".main-content .remove-contri").on("click", function (e) {
        e.preventDefault();
        var data = $(this).data();
        var projectId = parseInt(data.projectid);
        var memberId = parseInt(data.memberid);

        community.removeContributor(projectId, memberId);
        $(this).parent("li").fadeOut();
    });

    $(".main-content #open-for-collab").on("change", function (e) {
        var data = $(this).data();
        var projectId = parseInt(data.id);
        var status = $(this).is(":checked");

        community.updateCollaborationStatus(projectId, status);
    });

    $(".main-content #add-contri").on("click", function (e) {
        e.preventDefault();
        $("#contri-feedback").html("");

        if ($("#contri-email").val()){
           
            var data = $(this).data();
            var projectId = parseInt(data.id);
            var email = $("#contri-email").val();

            community.addContributor(projectId, email).done(function (data) {
                if (data.success) {
                    $("#contris").append("<li><a href=\"/member/" + data.memberId + "\">" + data.memberName + "</a> - <a data-projectid=\"" + projectId + "\" data-memberid=\"" + data.memberId + "\" class=\"remove-contri\" href=\"#\">Remove</a></li>");
                } else {
                    console.log(data.error);
                    $("#contri-feedback").html(data.error);
                }

                $("#contri-email").val("");
            });
        }
    });

    /* profile project forums ¨*/
    $("#forums .remove-forum").on("click", function (e) {
        e.preventDefault();
        var data = $(this).data();
        var forumId = parseInt(data.id);

        community.removeProjectForum(forumId);
        $(this).parent("li").fadeOut();
    });

    $(".profile-settings-forms #add-forum").on("click", function (e) {
        e.preventDefault();

        if ($("#forum-title").val() && $("#forum-description").val()) {
            
            var data = $(this).data();
            var projectId = parseInt(data.id);
            var title = $("#forum-title").val();
            var description = $("#forum-description").val();

            community.addProjectForum(title, description, projectId);
        }
    });
});
