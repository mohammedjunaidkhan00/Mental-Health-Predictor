const form = document.getElementById("predictionForm");
const resultBox = document.getElementById("resultBox");
const errorBox = document.getElementById("errorBox");
const scoreValue = document.getElementById("scoreValue");
const statusBadge = document.getElementById("statusBadge");
const predictBtn = document.getElementById("predictBtn");

// Quick Fill Sample Data (for easy testing)
document.getElementById("fillDemoBtn").addEventListener("click", () => {
  form.age.value = 25;
  form.gender.value = "Male";
  form.country.value = "India";
  form.academic_level.value = "Undergraduate";
  form.most_used_platform.value = "LinkedIn";
  form.purpose_of_use.value = "Networking";
  form.avg_daily_usage_hours.value = 4;
  form.daily_unlocks.value = 55;
  form.study_hours.value = 8;
  form.physical_activity_hours.value = 2;
  form.sleep_hours_per_night.value = 10;
  form.stress_level.value = "Medium";
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  resultBox.style.display = "none";
  errorBox.style.display = "none";

  const formData = new FormData(form);

  const data = {
    age: Number(formData.get("age")),
    gender: formData.get("gender"),
    country: formData.get("country").trim(),
    academic_level: formData.get("academic_level"),
    most_used_platform: formData.get("most_used_platform"),
    purpose_of_use: formData.get("purpose_of_use"),
    avg_daily_usage_hours: Number(formData.get("avg_daily_usage_hours")),
    daily_unlocks: Number(formData.get("daily_unlocks")),
    study_hours: Number(formData.get("study_hours")),
    physical_activity_hours: Number(formData.get("physical_activity_hours")),
    sleep_hours_per_night: Number(formData.get("sleep_hours_per_night")),
    stress_level: formData.get("stress_level"),
  };

  predictBtn.disabled = true;
  predictBtn.textContent = "Predicting...";

  try {

    const response = await fetch("https://mental-health-predictor-olzk.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail ? JSON.stringify(result.detail) : "Prediction failed.",
      );
    }

    const score = Number(result.predicted_mental_health_score);
    scoreValue.textContent = score.toFixed(2);

    // Score ke hisab se color aur status badalna
    if (score >= 7) {
      resultBox.style.background = "#ecfdf5";
      resultBox.style.borderColor = "#a7f3d0";
      statusBadge.style.background = "#10b981";
      statusBadge.style.color = "white";
      statusBadge.textContent = "Good Mental Well-being";
    } else if (score >= 4.5) {
      resultBox.style.background = "#fffbeb";
      resultBox.style.borderColor = "#fde68a";
      statusBadge.style.background = "#f59e0b";
      statusBadge.style.color = "white";
      statusBadge.textContent = "Moderate Well-being";
    } else {
      resultBox.style.background = "#fef2f2";
      resultBox.style.borderColor = "#fecaca";
      statusBadge.style.background = "#ef4444";
      statusBadge.style.color = "white";
      statusBadge.textContent = "Needs Attention / High Risk";
    }

    resultBox.style.display = "block";
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    errorBox.textContent =
      "Error: " + error.message + " (Make sure FastAPI server is running)";
    errorBox.style.display = "block";
  } finally {
    predictBtn.disabled = false;
    predictBtn.textContent = "Predict Mental Health Score";
  }
});

form.addEventListener("reset", function () {
  resultBox.style.display = "none";
  errorBox.style.display = "none";
});
