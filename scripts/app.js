let userJobSearchTitle;
let NUM_OF_JOBS_TO_SHOW = 9;
function loadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.toggle("flex");
  loadingScreen.classList.toggle("hidden");
}

async function getJob(jobTitle, jobLocation) {
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: `${jobTitle} in ${jobLocation}`,
      page: "1",
      num_pages: "10",
      date_posted: "all",
    },
    headers: {
      "x-rapidapi-key": "9169213196msh7485648104f9b26p164b34jsn9ffe7ad01f83",
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    loadingScreen();
    return response;
  } catch(error) {
    const newError = new Error('Sorry, something went wrong. Try restarting the page!')
    alert(newError)
    loadingScreen();
  }
}

function jobEmploymentTypeFormatter(job, element){
  if(job.job_employment_type == 'FULLTIME'){
    element.textContent = 'Full Time';
  }else if(job.job_employment_type == 'CONTRACTOR'){
    element.textContent = 'Contractor';
  }else if(job.job_employment_type == 'PARTTIME'){
    element.textContent = 'Part Time';
  }else{
    element.textContent = job.job_employment_type;
  }
}

function jobResults(response) {
  const jobResultSection = document.getElementById("search-results");
  const allJobsSection = document.getElementById("all-jobs-results");
  const searchResultTitle = document.getElementById('search-result-title');
  searchResultTitle.innerHTML = `Job Results for <span class="font-bold">${userJobSearchTitle}</span>`
  
  jobResultSection.classList.remove("hidden");
  
  const result = response.data.data;

  //Create job card
  let index = 0;
  result.forEach((job) => {
    if (index < NUM_OF_JOBS_TO_SHOW) {
      index++;
      const newJobCard = document.createElement("div");
      newJobCard.classList =
        "newjob flex flex-col gap-4 items-start w-full max-w-sm bg-white rounded-md p-4";
      newJobCard.innerHTML = `
          <p class="hidden" id="posted-job-id">${job.job_id}</p>
          <div class="flex items-center justify-between w-full">
            <img class="rounded-full maxImage" src="${job.employer_logo}" alt="">
            <div class="jobemploymenttype bg-slate-200 flex items-center rounded-full text-black px-4 py-2">
              
            </div>
          </div>
          <div class="flex flex-col gap-2 items-start justify-start w-full">
            <h6 class="jobTitle font-semibold text-[1.2rem]">${job.job_title}</h6>
            <div class="flex items-center gap-2">
              <p>${job.employer_name}</p>
              <div class="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p>${job.job_country}</p>
            </div>
          </div>
          <p class="text-slate-500 trimDescription">${job.job_description}</p>
          <button id="view-job-btn" type="button" class="max-w-xl py-3 px-6 rounded-md bg-transparent border border-black hover:bg-[#26A4FF] hover:border-none transition-colors duration-100 flex items-center">View job</button>
  `;
      const jobEmploymentType = newJobCard.querySelector('.jobemploymenttype');
      const jobTitle = newJobCard.querySelector('.jobTitle');
      const viewJobBtn = newJobCard.querySelector('#view-job-btn');
      jobEmploymentTypeFormatter(job, jobEmploymentType)

      jobTitle.classList.add('trimTitle');
      showJobDetails(job, viewJobBtn)

      allJobsSection.append(newJobCard);
    }
  });
}

function searchJob() {
  const searchJobForm = document.getElementById("search-job-form");
  const jobTitle = document.getElementById("job-title");
  const jobLocation = document.getElementById("job-location");
  const allJobsSection = document.getElementById("all-jobs-results");
  searchJobForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadingScreen();
    //Save user job search title to userJobSearchTitle variable
    userJobSearchTitle = jobTitle.value;
    getJob(jobTitle.value, jobLocation.value).then((response) => {
      //Set all jobs section to empty first before creating new job and set num of jobs to display to 9
      allJobsSection.innerHTML = '';
      NUM_OF_JOBS_TO_SHOW = 9;

      jobResults(response);
      showMoreResults(response);
    });
    //Clear user Inputs
    jobTitle.value = "";
    jobLocation.value = "";
  });
}
searchJob();

function showMoreResults(response){
  const moreResultBtn = document.getElementById('show-more-results-btn');
  const allJobsSection = document.getElementById("all-jobs-results");
  const allJobs = allJobsSection.querySelectorAll(".newjob")
  moreResultBtn.addEventListener('click', ()=>{
    allJobsSection.innerHTML = '';
    NUM_OF_JOBS_TO_SHOW+=9
    jobResults(response);
  })
}


function dateFormatter(dateToFormat){
  const createdAt = new Date(dateToFormat);

  // Format date and time using Moment.js
  //const formattedDate = moment(createdAt).format('MMMM Do YYYY, h:mm:ss a');
  const formattedDate = moment(createdAt).format('MMMM Do YYYY');
  return formattedDate;
}

//Job Details
function jobDetailsPage(job){
  const jobDetailsSection = document.getElementById('job-description');
  const jobResultSection = document.getElementById("search-results");
  jobResultSection.classList.add('hidden')
  jobDetailsSection.classList.remove('hidden')

  //Updating the job details page with job information
  //const desHeading = jobDetailsSection.querySelector('.description-heading');
  //desHeading.innerHTML = `Job Details for <span class="font-bold">${job.job_title}</span>`

  const jobLogo = jobDetailsSection.querySelector('.company-logo');
  jobLogo.src = `${job.employer_logo}`

  const jobTitle = jobDetailsSection.querySelector('.job-title');
  jobTitle.textContent = `${job.job_title}`

  const jobCompany = jobDetailsSection.querySelector('.job-company');
  jobCompany.textContent = `${job.employer_name}`

  const jobCityAndCountry = jobDetailsSection.querySelector('.job-town-and-country');
  if(job.job_city != 'null'){
    jobCityAndCountry.textContent = `${job.job_city, job.job_country}`
  }else{
    jobCityAndCountry.textContent = `${job.job_country}`
  }

  const jobEmploymentType = jobDetailsSection.querySelector('.employment-type');
  jobEmploymentTypeFormatter(job, jobEmploymentType);

  const jobApplyBtn = document.getElementById('apply-job-btn');
  jobApplyBtn.href = `${job.job_apply_link}`;

  const jobDescription = jobDetailsSection.querySelector('.job-description');
  const paragraphs = job.job_description.split('\n').map(paragraph => `<p class="mb-4">${paragraph}</p>`).join('');
  jobDescription.innerHTML = paragraphs

  const jobDeadline = jobDetailsSection.querySelector('.application-deadline');
  const formattedDate = dateFormatter(job.job_offer_expiration_datetime_utc)
  jobDeadline.textContent = formattedDate;

  const jobPostingDate = jobDetailsSection.querySelector('.date-of-posting');
  const postingFormattedDate = dateFormatter(job.job_posted_at_datetime_utc)
  jobPostingDate.textContent = postingFormattedDate;

  const jobType = jobDetailsSection.querySelector('.job-employ-type');
  jobEmploymentTypeFormatter(job, jobType);

  const jobCategorySec = document.getElementById('job-categories-section');
  const jobCategory = document.getElementById('job-categories');
  if(job.job_occupational_categories != "null"){
    jobCategorySec.classList.remove('flex');
    jobCategorySec.classList.add('hideCate');

    const allCategories = job.job_occupational_categories;
    allCategories.forEach((cate)=>{
      const newCateElement = document.createElement('div')
      newCateElement.classList = 'flex items-center rounded-full bg-[#FF6550]/10 text-[#FF6550] px-4 py-2';
      newCateElement.textContent = cate;
      jobCategory.append(newCateElement);
    })
  }

  const requredSkillsSec = document.getElementById('job-required-skills-section');
  const requredSkills = document.getElementById('job-required-skills');
  if(job.job_required_skills != "null"){
    requredSkillsSec.classList.remove('hidden');
    requredSkillsSec.classList.add('flex');

    const allSkills = job.job_required_skills;
    allSkills.forEach((skill)=>{
      const newSkillElement = document.createElement('div')
      newSkillElement.classList = 'flex items-center rounded-full bg-[#4640DE]/10 text-[#4640DE] px-4 py-2';
      newSkillElement.textContent = skill;
      requredSkills.append(newSkillElement);
    })
  }
}

function showJobDetails(job, showJobBtn){
  showJobBtn.addEventListener('click', ()=>{
      jobDetailsPage(job)
  })
}

function backToJobResults(){
  const backToSearchBtn = document.getElementById('go-back-to-jobs-btn');
  const jobDetailsSection = document.getElementById('job-description');
  const jobResultSection = document.getElementById("search-results");

  backToSearchBtn.addEventListener('click', ()=>{
    jobResultSection.classList.remove('hidden')
    jobDetailsSection.classList.add('hidden')
  }) 
}
backToJobResults()

//Site
//https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/playground/apiendpoint_23823c0b-cab1-4b42-8b13-1ccae3496c07
