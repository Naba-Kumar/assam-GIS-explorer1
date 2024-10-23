// const nav = document.querySelector('.sidebar-nav').querySelectorAll('li');

// console.log(nav)

// nav.forEach(elements => {
//     elements.addEventListener("click", function(){
//         nav.forEach(nav => nav.classList.remove("active"))
//         console.log(this.classList)
//         this.classList.add("active")
//     })
// })


document.addEventListener("DOMContentLoaded", function() {
    const nav = document.querySelector('.sidebar-nav');

    nav.addEventListener("click", function(event) {
        const target = event.target;
        
        if (target.tagName === 'li') {
            nav.querySelectorAll('li').forEach(li => li.classList.remove("active"));
            target.classList.add("active");
        }
    });
});


const sidebarToggle = document.querySelector("#sidebar-toggle");
sidebarToggle.addEventListener("click",function(){
    document.querySelector("#sidebar").classList.toggle("collapsed");
});

document.querySelector(".theme-toggle").addEventListener("click",() => {
    toggleLocalStorage();
    toggleRootClass();
});

function toggleRootClass(){
    const current = document.documentElement.getAttribute('data-bs-theme');
    const inverted = current == 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme',inverted);
}

function toggleLocalStorage(){
    if(isLight()){
        localStorage.removeItem("light");
    }else{
        localStorage.setItem("light","set");
    }
}

function isLight(){
    return localStorage.getItem("light");
}

if(isLight()){
    toggleRootClass();
}
