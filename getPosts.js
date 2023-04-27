//let topPosts = [];


async function getTopPosts() {
  let topPosts=[]
    const postTitle = document.getElementById("post_title").value;
    const subredditQuery=document.getElementById("subreddit").value;

    if(subredditQuery){
        const url = `https://www.reddit.com/r/${subredditQuery}/search.json?q=${postTitle}`;

        fetch(url)
  .then(response => response.json())
  .then(data => {
    const posts = data.data.children;
    const postContainer = document.querySelector(".layout__main");

    // Clear previous posts
    postContainer.innerHTML = "";
    console.log(posts)
    posts.forEach(post => {
      const postAuthor = post.data.author;
      const postTitle = post.data.title;
      const postUrl = post.data.url;
      const postThumbnail = post.data.thumbnail;
      

      const postElement = `
      <div class="post" onClick='viewPost(${JSON.stringify(post)})'>
      

          <img src="${postThumbnail}" alt="" class="post__author-logo"/>
          <div class="post__details">
            <h2 class="post__title">
              <a href="${postUrl}">${postTitle}</a>
            </h2>
            <p class="post__author">Posted by ${postAuthor}</p>
          </div>
        </div>
      `;
      postContainer.insertAdjacentHTML("beforeend", postElement);
    });

  })
  .catch(error => {
    console.error(error);
  });


        
    }
  
    if(!subredditQuery){
      const subredditResults = await fetch(`https://www.reddit.com/search.json?q=${postTitle}&type=sr`);
    const subredditData = await subredditResults.json();
  
    // if (subredditData.data.children.length === 0) {
    //   alert(`Subreddits not found for post title "${postTitle}"`);
    //   return;
    // }
  
    const topSubreddits = subredditData.data.children
      .slice(0, 3)
      .map((child) => child.data.display_name_prefixed);
  

    for (const subredditName of topSubreddits) {
      const topPostsResult = await fetch(`https://www.reddit.com/${subredditName}/top.json?t=day`);
      const topPostsData = await topPostsResult.json();
  
      const subredditTopPosts = topPostsData.data.children
        .slice(0, topPostsData.data.children.length)
        .map(async (child) => {
          const postDetailsResult = await fetch(`https://www.reddit.com${child.data.permalink}.json`);
          const postDetailsData = await postDetailsResult.json();
          return {
            base:child,
            title: child.data.title,
            subredditsrc: subredditName,
            author: child.data.author,
            created: new Date(child.data.created_utc * 1000),
            image: child.data.thumbnail,
            url: child.data.url,
          };
        });
  
      topPosts = topPosts.concat(await Promise.all(subredditTopPosts));
    }

    console.log(topPosts)
  
    const topPostsHtml = topPosts
      .map(
        (post) =>
        `<div class="post xyz">
            <h2><a href="${post.url}">${post.title}</a>
            </h2>
            <p>Subreddit: ${post.subredditsrc}</p>
            <p>Author: ${post.author}</p>
            <p>Published: ${post.created.toISOString()}</p>
            ${post.image && post.image !== 'self' ? `<img src="${post.image}" style="max-width: 100%">` : ''}
          
          </div>`
      )
      .join("");
  
    document.querySelector('.post').innerHTML = topPostsHtml;
    }

    document.querySelectorAll('.xyz').forEach(function(element) {
        element.addEventListener('click', function(event) {
          var childNumber = 1;
          var sibling = event.target.previousElementSibling;
          while (sibling != null) {
            childNumber++;
            sibling = sibling.previousElementSibling;
          }
          console.log('Clicked on child number ' + childNumber);

          viewPost(topPosts[childNumber - 1].base)
        });
      });
  }



  function viewPost(post){
    
    console.log(post)
    const postContainer = document.querySelector(".layout__main");
    
    const comments = fetch(`https://www.reddit.com/r/${post.data.subreddit}/comments/${post.data.id}.json`)
      .then(response => response.json())
      .then(data => {
        const comments = data[1].data.children;
  
        const topThreeComments = comments
          .sort((a, b) => b.data.score - a.data.score)
          
  
        const commentsList = document.createElement('ul');
        commentsList.classList.add('comments-list');
        topThreeComments.forEach(comment => {
          const commentItem = document.createElement('li');
          commentItem.classList.add('comment');
          commentItem.innerHTML = `
            <p class="comment-author">${comment.data.author}</p>
            <p class="comment-body">${comment.data.body}</p>
            <p class="comment-score">Score: ${comment.data.score}</p>
          `;
          commentsList.appendChild(commentItem);
        });
        console.log(comments)
  
        postContainer.innerHTML = `
          
  
          <div class="post">
          <button class="back-button" onClick="goBack()">Back</button>
            <h1>${post.data.title}</h1>
            <p>Author: ${post.data.author}</p>
            <img src="${post.data.thumbnail}" alt="${post.title}">
            <a href="${post.data.url}" target="_blank">Read More</a>
          </div>
  
          
  
          <div>
            <input type="text" id="searchBar" placeholder="Search comments...">
            <button onclick="handleSearch()">Search</button>
  
            <div id="searchedComments"></div>
          </div>

          <div class="comments">
            <h2>Top Comments</h2>
            ${commentsList.outerHTML}
          </div>
        `;
        
        
        
      })
      .catch(error => console.error(error));
  }
  
function handleSearch() {
          const searchTerm = document.getElementById("searchBar").value.toLowerCase();
          const comments = document.querySelectorAll(".comment");
          const searchedCommentsContainer = document.getElementById("searchedComments");
          let matchedComments = [];
        
          // Loop through all comments and check if they contain the search term
          comments.forEach(comment => {
            const commentText = comment.textContent.toLowerCase();
            if (commentText.includes(searchTerm)) {
              matchedComments.push(comment.outerHTML);
            }
          });
        
          // Display matched comments in a container
          if (matchedComments.length > 0) {
            searchedCommentsContainer.innerHTML = `<h3>Matching Comments</h3>${matchedComments.join("")}`;
          } else {
            searchedCommentsContainer.innerHTML = "No matching comments found.";
          }
        }

function goBack(){
  const post=document.getElementsByClassName("post")
  post.innerHTML=""
  getTopPosts();
}        
  
