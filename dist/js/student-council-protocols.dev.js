var studentCouncilProtocols = {};
studentCouncilProtocols = studentCouncilProtocols || {};
studentCouncilProtocols.protocol = studentCouncilProtocols.protocol || {};

studentCouncilProtocols.protocol.userVisit = (function ($) {

    function userVisit() {
        $(function() {
          this.init();
        }.bind(this));
    }

    userVisit.prototype.init = function() {

        var posts_visited = JSON.parse(localStorage.getItem('posts_visited')); 
        var is_visited = posts_visited ? posts_visited.indexOf(userVisitData.post_id) : null;
        
        var increment = false;
        
        if (!is_visited || is_visited === -1) {
          // if a post has never been visited before
          if (!posts_visited) {
            localStorage.setItem('posts_visited', JSON.stringify([userVisitData.post_id]));
          } else {
            posts_visited.push(userVisitData.post_id)
            localStorage.setItem('posts_visited', JSON.stringify(posts_visited));
          }
          increment = true;
        }

        $.ajax({
          url: userVisitData.ajax_url,
          type: 'post',
          data: {
              action: 'userVisitAjax',
              increment: increment,
              postId: userVisitData.post_id,
              nonce: userVisitData.nonce
          },
          beforeSend: function (xhr) {
            xhr.setRequestHeader('X-WP-Nonce', userVisitData.nonce );
          },
          success: function(response) {
            console.log(response);
          },
          error: function(xhr, error){
              console.debug(xhr); 
              console.debug(error);
          },
      });
    }

    return new userVisit();

})(jQuery);
