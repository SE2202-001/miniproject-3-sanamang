class JobPost {
    constructor({ Title, Posted, Type, Level, Skill, Detail }) {
      this.title = Title;
      this.postedTime = Posted;
      this.jobType = Type;
      this.jobLevel = Level;
      this.requiredSkill = Skill;
      this.description = Detail;
    }
  
    calculatePostedMinutes() {
      const timeUnits = { minute: 1, hour: 60, day: 1440 };
      const [value, unit] = this.postedTime.split(" ");
      return parseInt(value) * (timeUnits[unit.replace(/s$/, "")] || 0);
    }
  
    getJobDetails() {
      return `
        <div class="job-card-details">
          <h3>${this.title}</h3>
          <p><strong>Type:</strong> ${this.jobType}</p>
          <p><strong>Level:</strong> ${this.jobLevel}</p>
          <p><strong>Skill:</strong> ${this.requiredSkill}</p>
          <p><strong>Description:</strong> ${this.description}</p>
          <p><strong>Posted:</strong> ${this.postedTime}</p>
        </div>
      `;
    }
  }
  
  const jobCollection = [];
  document.getElementById("load-data").addEventListener("click", () => {
    const fileInput = document.getElementById("upload-json");
    const file = fileInput.files[0];
    if (!file) return alert("Please upload a JSON file.");
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        processJobData(parsedData);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  });
  
  function processJobData(data) {
    jobCollection.length = 0;
    const levelOptions = new Set(), typeOptions = new Set(), skillOptions = new Set();
  
    data.forEach((jobData) => {
      const job = new JobPost(jobData);
      jobCollection.push(job);
  
      levelOptions.add(job.jobLevel);
      typeOptions.add(job.jobType);
      skillOptions.add(job.requiredSkill);
    });
  
    populateDropdowns(levelOptions, "filter-level");
    populateDropdowns(typeOptions, "filter-type");
    populateDropdowns(skillOptions, "filter-skill");
  
    renderJobs(jobCollection);
  }
  
  function populateDropdowns(options, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = `<option value="">Filter by ${dropdown.id.split("-")[1]}</option>`;
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      dropdown.appendChild(optionElement);
    });
  }
  
  function renderJobs(jobs) {
    const jobContainer = document.getElementById("job-list");
    jobContainer.innerHTML = "";
    jobs.forEach((job) => {
      const jobCard = document.createElement("div");
      jobCard.classList.add("job-card");
      jobCard.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Type:</strong> ${job.jobType} | <strong>Level:</strong> ${job.jobLevel}</p>
        <p><strong>Skill:</strong> ${job.requiredSkill}</p>
        <button onclick="displayJobDetails('${job.title}')">View Details</button>
      `;
      jobContainer.appendChild(jobCard);
    });
  }
  
  function displayJobDetails(title) {
    const selectedJob = jobCollection.find((job) => job.title === title);
  
    // Create a pop-up container
    const popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";
    popupContainer.style.position = "fixed";
    popupContainer.style.top = "0";
    popupContainer.style.left = "0";
    popupContainer.style.width = "100vw";
    popupContainer.style.height = "100vh";
    popupContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    popupContainer.style.display = "flex";
    popupContainer.style.justifyContent = "center";
    popupContainer.style.alignItems = "center";
    popupContainer.style.zIndex = "1000";
  
    // Create the content box
    const popupBox = document.createElement("div");
    popupBox.style.backgroundColor = "white";
    popupBox.style.padding = "20px";
    popupBox.style.borderRadius = "10px";
    popupBox.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.25)";
    popupBox.style.maxWidth = "500px";
    popupBox.style.textAlign = "center";
  
    popupBox.innerHTML = `
      <h2>Job Details</h2>
      <p><strong>Title:</strong> ${selectedJob.title}</p>
      <p><strong>Type:</strong> ${selectedJob.jobType}</p>
      <p><strong>Level:</strong> ${selectedJob.jobLevel}</p>
      <p><strong>Skill:</strong> ${selectedJob.requiredSkill}</p>
      <p><strong>Description:</strong> ${selectedJob.description}</p>
      <p><strong>Posted:</strong> ${selectedJob.postedTime}</p>
      <button id="close-popup" style="margin-top: 20px; padding: 10px 20px;">Close</button>
    `;
  
    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);
  
    // Add an event listener to close the pop-up
    document.getElementById("close-popup").addEventListener("click", () => {
      document.body.removeChild(popupContainer);
    });
  }
  
  document.getElementById("filter-level").addEventListener("change", applyFilters);
  document.getElementById("filter-type").addEventListener("change", applyFilters);
  document.getElementById("filter-skill").addEventListener("change", applyFilters);
  document.getElementById("sort-jobs").addEventListener("change", sortJobs);
  
  function applyFilters() {
    const selectedLevel = document.getElementById("filter-level").value;
    const selectedType = document.getElementById("filter-type").value;
    const selectedSkill = document.getElementById("filter-skill").value;
  
    const filteredJobs = jobCollection.filter((job) => {
      return (
        (!selectedLevel || job.jobLevel === selectedLevel) &&
        (!selectedType || job.jobType === selectedType) &&
        (!selectedSkill || job.requiredSkill === selectedSkill)
      );
    });
  
    renderJobs(filteredJobs);
  }
  
  function sortJobs() {
    const sortingCriteria = document.getElementById("sort-jobs").value;
  
    const sortedJobs = [...jobCollection].sort((a, b) => {
      if (sortingCriteria === "title-asc") return a.title.localeCompare(b.title);
      if (sortingCriteria === "title-desc") return b.title.localeCompare(a.title);
      if (sortingCriteria === "time-asc") return a.calculatePostedMinutes() - b.calculatePostedMinutes();
      if (sortingCriteria === "time-desc") return b.calculatePostedMinutes() - a.calculatePostedMinutes();
      return 0;
    });
  
    renderJobs(sortedJobs);
  }