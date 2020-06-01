(function () {
    $.ajax({
        url: "./links.json",
        method: "GET",
        success: function (response) {
            var linksHtml = "";

            for (var i = 0; i < response.length; i++) {
                linksHtml += `<a id='link' href='${response[i].url}'> ${response[i].title}</a>`;
            }

            $("#headlines").html(linksHtml);
            moveHeadlines();
        },
        error: function (err) {
            console.log(err);
        },
    });

    var anim;
    var left = $("#headlines").offset().left;

    function moveHeadlines() {
        left--;
        if (left < -$("a").eq(0).outerWidth()) {
            left += $("a").eq(0).outerWidth();

            $("#headlines").append($("a").eq(0));
        }

        $("#headlines").css({
            left: left,
        });
        anim = requestAnimationFrame(moveHeadlines);
    }
    $("#headlines").on("mouseenter", () => {
        cancelAnimationFrame(anim);
    });

    $("#headlines").on("mouseleave", () => {
        moveHeadlines();
    });
})();
