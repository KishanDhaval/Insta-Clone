document.addEventListener('DOMContentLoaded', function() {
    var inp = document.querySelector(".input");

    inp.addEventListener("input", function (e) {
        if (inp.value !== '' ) {
            fetch(`/search/${encodeURIComponent(inp.value)}`)
                .then(raw => raw.json())
                .then(result => {
                    let clutter = "";

                    result.forEach((item) => {
                        clutter += `
                            <a href="/profile/${item.username}" class="outline-none">
                                <div class="text-white flex items-center relative gap-2 mt-5">
                                    <div class="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                                        <img class="h-full w-full object-cover" src="/images/uploads/${item.picture}" alt="">
                                    </div>
                                    <div class="text">
                                        <h3>${item.username}</h3>
                                        <h4 class="text-xs opacity-30 leading-none">${item.name}</h4>
                                    </div>
                                </div>            
                            </a>
                        `;
                    });

                    document.querySelector(".users").innerHTML = clutter;
                });
        } else {
            document.querySelector(".users").innerHTML = '';
        }
    });

    // Load followers by default
    fetch('/followers/default')
        .then(raw => raw.json())
        .then(result => {
            let clutter = "";

            result.forEach((item) => {
                clutter += `
                    <a href="/profile/${item.username}" class="outline-none">
                        <div class="text-white flex items-center relative gap-2 mt-5">
                            <div class="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                                <img class="h-full w-full object-cover" src="/images/uploads/${item.picture}" alt="">
                            </div>
                            <div class="text">
                                <h3>${item.username}</h3>
                                <h4 class="text-xs opacity-30 leading-none">${item.name}</h4>
                            </div>
                        </div>            
                    </a>
                `;
            });

            document.querySelector(".users").innerHTML = clutter;
        });
});






// document.addEventListener('DOMContentLoaded', function() {
//     var inp = document.querySelector(".input");

//     inp.addEventListener("input", function (e) {
//         var inputValue = inp.value.trim().toLowerCase();

//         // Make an AJAX request to search for followers
//         fetch(`/search/followers/${encodeURIComponent(inputValue)}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             credentials: 'same-origin' // Send cookies if any
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Failed to search for followers');
//             }
//             return response.json();
//         })
//         .then(followers => {
//             // Process the fetched followers data
//             console.log('Searched Followers:', followers);
//             // Update your UI with the searched followers data here
//         })
//         .catch(error => {
//             // Handle errors
//             console.error('Error searching for followers:', error);
//         });
//     });
// });







