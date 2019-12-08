const API = "https://librarylongtail.herokuapp.com"

// --------- nav bar -------------------

// searches for books by title terms
$("body").on("click", "#dbBtn", function (event) {
    // get the user input value
    event.preventDefault()
    let user_search = $("#user_text").val()

    // clear the search bar
    $("#user_text").val("")

    // search for the user input value
    // localhost:3000/search?term=user_search
    // whatever we get, console log
    let searchUrl = API + "/search?term=" + user_search;
    $.get(searchUrl, function (response) {
        createBookCards(response.books)
    })
})

// Make the Add Author button dynamically show a form to add an author. When the author is added, have them prepended on the list of authors. Make sure to use HTML 5 form validations for minlength maxlength, required et c
$("body").on("click", ".add_author_btn", function (event) {
    // firstName,
    // lastName,
    // bio,
    // avatar
    let formTemplate = $(`<form id="add_author_form" style="width:100%">
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input type="text" class="form-control" id="firstName" maxlength="30" placeholder="Enter First Name" required>
    </div>
    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input type="text" class="form-control" id="lastName" placeholder="Enter Last Name" maxlength="30" required>
    </div>
    <div class="form-group">
    <div class="form-group">
    <label for="bio">Bio</label>
    <input type="text" class="form-control" id="bio" placeholder="Enter Bio Info" maxlength="30" required>
  </div>
  <div class="form-group">
  <div class="form-group">
      <label for="avatar">Author Image</label>
      <input type="text" class="form-control" id="avatar" placeholder="Enter Image Url" maxlength="100" required>
    </div>
    <div class="form-group">
    <input type="submit" class="form-control" id="submit_btn">
  </div>
  </form>`)


    // append it to the add author button
    $(".add-author").append(formTemplate)
})

// create an author when the user clicks the Add Author btn
$("body").on("submit", "#add_author_form", (event) => {
    event.preventDefault()

    //get the values from the input feilds
    let firstName = $("#firstName").val()

    let lastName = $("#lastName").val()
    let bio = $("#bio").val()
    let avatar = $("#avatar").val()

    //send this off to the database
    $.post(API + "/author", {
        firstName,
        lastName,
        bio,
        avatar
    }, function (response) {

        createAlert("#add_author_form");
        if (response.success) {
            $("#lastName").val("")
            $("#firstName").val("")
            $("#bio").val("")
            $("#avatar").val("")

            $("#alert").addClass("alert-success")
            $("#alertmsg").text(response.success)

            setTimeout(function () {
                window.location.reload();
            }, 500);

        } else {
            $("#alert").addClass("alert-danger")
            $("#alertmsg").text(response.error)
        }


        console.log(response)
    })
})

// -----x---- nav bar ---------x----------

// --------- dynamically creates author cards -------------------

// Make a request to our GET /authors route when the page loads
let authorUrl = API + "/author"
$.get(authorUrl, function (response) {
    console.log(response)

    // Build cards for each other in the response
    // Each card will have the following
    // an image for the avatar
    // the author full name
    // the bio

    for (let index = 0; index < response.results.length; index++) {
        const element = response.results[index];
        let firstname = element.firstName
        let lastname = element.lastName
        let bio = element.bio
        let avatar = element.avatar

        let card = $("<div>").attr({
            authorId: element.id,
            class: "card custom_card author_card"
        })

        if (avatar === null) {
            let rand = Math.floor(Math.random() * 10);
            avatar = `https://avatars.dicebear.com/v2/human/${rand}.svg`
        }

        let avatarContainer = $("<div>")
        let avatarImg = $("<img>").attr({
            id: `image_${element.id}`,
            authorId: element.id,
            class: "avatar",
            src: avatar
        })
        avatarContainer.append(avatarImg)

        let authorInfo = $("<div>").addClass("author_info_container").attr({
            authorId: element.id,
        })

        let authorfirstName = $("<p>").attr({
            authorId: element.id,
            contenteditable: "false",
            id: `edit_authorfirstname${element.id}`
        }).addClass("author_name").html(firstname);

        let authorlastName = $("<p>").attr({
            authorId: element.id,
            contenteditable: "false",
            id: `edit_authorlastname${element.id}`
        }).addClass("author_name").html(lastname);

        let authorBio = $("<p>").attr({
            authorId: element.id,
            contenteditable: "false",
            id: `edit_bio${element.id}`
        }).addClass("author_bio").html(bio);

        let imageEditable = $("<div>").attr({
            contenteditable: "false",
            id: `image_edit${element.id}`
        });

        let btnGetBooks = $("<button>").html("See Books").addClass("btn btn-info get_book_btn").attr({
            author_id: element.id
        })

        let btnAddBook = $("<button>").html("Add Book").addClass("btn btn-info add_book_btn").attr({
            author_id: element.id
        })

        let btnEditAuthor = $("<button>").html("Edit Author").addClass("btn btn-info edit_author_btn").attr({
            author_id: element.id
        })

        let btnDeleteAuthor = $("<button>").html("Remove Author").addClass("btn btn-danger delete_author_btn").attr({
            author_id: element.id
        })

        authorInfo.append([authorfirstName, authorlastName, authorBio]);

        card.append([avatarContainer, authorInfo, imageEditable, btnGetBooks, btnAddBook, btnEditAuthor, btnDeleteAuthor])

        $("#card__contain").append(card)
    }
})

// -----X---- dynamically creates author cards -----X--------------

// --------- authors card buttons  -------------------

// When see books button is clicked, go get the books written by that author and console log them
$("body").on("click", ".get_book_btn", function (event) {

    let target = $(event.target)
    let authorId = target.attr("author_id")

    getAuthorBooks(authorId)
})

// when edit author button is clicked edit the authors details
$("body").on("click", ".edit_author_btn", (event) => {
    console.log(event)
    let button = $(event.currentTarget)
    let authorid = $(event.target).attr("author_id")
    // let url = API + `/${authorid}/bio`
    let value = $(`#image_edit${authorid}`).attr('contenteditable')
    if (value === 'false') {
        let imageSrc = $(`#image_${authorid}`).attr("src")
        $(`#image_edit${authorid}`).attr('contenteditable', 'true')
        $(`#image_edit${authorid}`).html(imageSrc)

        $(`#edit_bio${authorid}`).attr('contenteditable', 'true');
        $(`#edit_authorfirstname${authorid}`).attr('contenteditable', 'true');
        $(`#edit_authorlastname${authorid}`).attr('contenteditable', 'true');
        button.html("Save Author");
    } else {
        // firstName,
        // lastName,
        // bio,
        // avatar
        let avatar = $(`#image_edit${authorid}`).html()
        let bio = $(`#edit_bio${authorid}`).html()
        let firstName = $(`#edit_authorfirstname${authorid}`).html()
        let lastName = $(`#edit_authorlastname${authorid}`).html()
        let url = API + `/author/${authorid}`
        $.ajax({
            url,
            type: 'PUT',
            data: {
                firstName,
                lastName,
                bio,
                avatar
            },
            success: (result) => {
                console.log(result)
            }
        });
        $(`#image_edit${authorid}`).attr('contenteditable', 'false');
        $(`#image_${authorid}`).attr("src", avatar)
        $(`#image_edit${authorid}`).empty();
        $(`#edit_bio${authorid}`).attr('contenteditable', 'false');
        $(`#edit_authorfirstname${authorid}`).attr('contenteditable', 'false');
        $(`#edit_authorlastname${authorid}`).attr('contenteditable', 'false');
        button.html("Edit Author");


    }

});

// when Delete Author button is clicked delete the the author
$("body").on("click", ".delete_author_btn", (event) => {
    let author_id = $(event.target).attr("author_id")
    let url = API + `/author/${author_id}`
    $.ajax({
        url,
        type: 'DELETE',
        success: (result) => {
            console.log(result)
            if (result.success) {
                $(event.target).parent().hide()
            }
        }
    });
})

// Adds a new book when the user clicks 
$("body").on("click", ".add_book_btn", function (event) {
    let authorid = $(event.target).attr("author_id")
    // append it to the author card
    let authorCard = $(event.target).parent()
    bookForm(authorCard, "", "", authorid, "add_book_form")

})

// creates a new book when the add book form is submitted
$("body").on("submit", "#add_book_form", (event) => {
    event.preventDefault()
    // $("#add_book_form").hide();
    //get the values from the input feilds
    let title = $("#title").val()

    let isbn = $("#isbn").val()
    let authorId = $("#submit_btn").attr("author_id")

    //send this off to the database
    $.post(API + "/book", {
        title,
        isbn,
        authorId
    }, function (response) {

        createAlert("#add_book_form");
        if (response.success) {
            $("#isbn").val("")
            $("#title").val("")

            $("#alert").addClass("alert-success")
            $("#alertmsg").text(response.success)
            // setTimeout(function () {
            //     window.location.reload();
            // }, 500);
            getAuthorBooks(authorId)

        } else {
            $("#alert").addClass("alert-danger")
            $("#alertmsg").text(response.error)
        }


        console.log(response)
    })
})

// ----x----- authors card buttons  ---------x----------

// --------- book card buttons  -------------------

// editing book info
$("body").on("click", "#edit-btn", (event) => {
    let button = $(event.target)
    let bookid = $(event.target).attr("bookid")
    // let container = button.parent()
    let value = $(`#book-title${bookid}`).attr('contenteditable')
    if (value === "false") {
        $(`#book-title${bookid}`).attr('contenteditable', 'true')
        button.html("Save Book");
    } else {
        // title,
        // authorId,
        // isbn
        let title = $(`#book-title${bookid}`).html()
        let isbn = button.attr("isbn")
        let authorId = button.attr("authorid")
        let url = API + `/book/${bookid}`
        $.ajax({
            url,
            type: 'PUT',
            data: {
                title,
                authorId,
                isbn
            },
            success: (result) => {
                console.log(result)
            }
        });
        $(`#book-title${bookid}`).attr('contenteditable', 'false')
        button.html("Edit");
    }
})

// delete a book when this button is clicked
$("body").on("click", ".delete-btn", (event) => {
    let bookId = $(event.target).attr("bookId")
    let url = API + `/book/${bookId}`
    $.ajax({
        url,
        type: 'DELETE',
        success: (result) => {
            console.log(result)
            if (result.success) {
                $(event.target).parent().hide()
            }
        }
    });
})

// edits a book when the edit book form is submitted
// $("body").on("submit", "#edit_book_form", (event) => {
//     event.preventDefault()
//     // $("#add_book_form").hide();
//     //get the values from the input feilds
//     let title = $("#title").val()

//     let isbn = $("#isbn").val()
//     let authorId = $("#submit_btn").attr("author_id")

//     //send this off to the database
//     $.post(API + "/book", {
//         title,
//         isbn,
//         authorId
//     }, function (response) {

//         createAlert("#add_book_form");
//         if (response.success) {
//             $("#isbn").val("")
//             $("#title").val("")

//             $("#alert").addClass("alert-success")
//             $("#alertmsg").text(response.success)
//             // setTimeout(function () {
//             //     window.location.reload();
//             // }, 500);
//             getAuthorBooks(authorId)

//         } else {
//             $("#alert").addClass("alert-danger")
//             $("#alertmsg").text(response.error)
//         }


//         console.log(response)
//     })
// })

// -----x---- book card buttons  --------x-----------

function getAuthorBooks(authorId) {
    let authorBooksUrl = API + `/book/${authorId}`

    $.get(authorBooksUrl, function (response) {
        console.log(response)
        createBookCards(response.books)
    })
}

function createBookCards(books) {
    // Clear the books first
    $('#books').empty();
    console.log(books)
    // loop over the books array
    // Create a book card for each of them
    for (let index = 0; index < books.length; index++) {
        const element = books[index];
        let {
            id,
            title,
            isbn,
            authorId
        } = element

        let deleteBtn = $("<button>").attr({
            bookId: id,
            class: "btn btn-danger delete-btn"
        }).html("Delete")

        let editBtn = $("<button>").attr({
            bookId: id,
            authorId,
            isbn,
            class: "btn btn-warning",
            id: `edit-btn`
        }).html("Edit")

        let card = $("<div>").addClass("card custom_card book_card");
        let bookTitle = $('<p>').html(title).attr({
            contenteditable: "false",
            id: `book-title${element.id}`
        })
        $(card).append([bookTitle, editBtn, deleteBtn])
        $('#books').append(card)
    }
}

function createAlert(alertContainer) {
    let alert = $(`<div id="alert" class="alert alert-dismissible fade show" role="alert">
    <p id="alertmsg"></p>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`)

    $(alertContainer).prepend(alert)
}

function bookForm(container, title, isbn, authorid, formId) {

    let formTemplate = $(`<form id="${formId}" style="width:100%">
    <div class="form-group">
      <label for="title">Book Title</label>
      <input type="text" class="form-control" id="title" minlength="1" maxlength="100" placeholder="Enter title" required value="${title}">
    </div>
    <div class="form-group">
      <label for="isbn">Book ISBN Number</label>
      <input type="text" class="form-control" id="isbn" placeholder="Enter ISBN" minlength="13" maxlength="13" required value="${isbn}">
    </div>
    <div class="form-group">
    <input type="submit" author_id=${authorid} class="form-control" id="submit_btn" placeholder="Enter ISBN" minlength="13" maxlength="13">
  </div>
  </form>`)

    container.append(formTemplate)
}