// Get the main post container element


// Function to fetch and display trending posts
function getPostsTrending() {
  const postContainer = document.querySelector('.layout__main .post');  
  // Clear previous posts
  postContainer.innerHTML = '';

  // Fetch trending posts from Reddit
  fetch('https://www.reddit.com/r/popular.json')
    .then(response => response.json())
    .then(data => {
      const posts = data.data.children;

      // Add each post to the main section
      posts.forEach(post => {
        const postElement = createPostElement(post.data);
        postContainer.appendChild(postElement);
      });
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
    });
}

// Function to create a post element
function createPostElement(postData) {
  // Create a div element to hold the post content
  const postElement = document.createElement('div');
  postElement.classList.add('post');

  // Add the post title and link
  const titleElement = document.createElement('h2');
  const titleLink = document.createElement('a');
  titleLink.textContent = postData.title;
  titleLink.href = postData.url;
  titleLink.target = '_blank';
  titleElement.appendChild(titleLink);
  postElement.appendChild(titleElement);

  // Add the post author and timestamp
  const authorElement = document.createElement('p');
  authorElement.textContent = `Posted by u/${postData.author} on ${new Date(postData.created_utc * 1000)}`;
  postElement.appendChild(authorElement);

  // Add the post score and comment count
  const scoreElement = document.createElement('p');
  scoreElement.textContent = `Score: ${postData.score} | Comments: ${postData.num_comments}`;
  postElement.appendChild(scoreElement);

  return postElement;
}
