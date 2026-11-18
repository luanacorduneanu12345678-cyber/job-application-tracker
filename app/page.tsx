"use client";

import { useEffect, useState } from "react";

type Job = {
  id: number;
  company: string;
  position: string;
  status: string;
  date?: string;
};

// Transformă data în format românesc: zz/ll/aaaa
function formatDate(date?: string) {
  if (!date) return "Nespecificată";

  // Compatibilitate cu datele vechi: aaaa-ll-zz
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date.split("-").reverse().join("/");
  }

  return date;
}

// Verifică dacă data introdusă este reală
function isValidDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const parsedDate = new Date(year, month - 1, day);

  return (
    year >= 1000 &&
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
}

export default function Home() {
  // Lista joburilor
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Formular
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [date, setDate] = useState("");

  // Căutare și filtrare
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Încărcăm joburile salvate
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem("job-tracker");

      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);

        if (Array.isArray(parsedJobs)) {
          setJobs(parsedJobs);
        }
      }
    } catch (error) {
      console.error("Eroare la încărcarea joburilor:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Salvăm automat modificările
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("job-tracker", JSON.stringify(jobs));
  }, [jobs, loaded]);

  // Adăugăm un job
  function addJob() {
    if (!company.trim() || !position.trim()) {
      alert("Completează numele companiei și poziția!");
      return;
    }

    if (date && !isValidDate(date)) {
      alert("Introdu o dată validă în formatul zz/ll/aaaa!");
      return;
    }

    const newJob: Job = {
      id: Date.now(),
      company: company.trim(),
      position: position.trim(),
      status: "Applied",
      date: date || new Date().toLocaleDateString("en-GB"),
    };

    setJobs((previousJobs) => [...previousJobs, newJob]);

    setCompany("");
    setPosition("");
    setDate("");
  }

  // Ștergem un job
  function deleteJob(id: number) {
    const confirmed = window.confirm(
      "Sigur vrei să ștergi această aplicație?"
    );

    if (!confirmed) return;

    setJobs((previousJobs) =>
      previousJobs.filter((job) => job.id !== id)
    );
  }

  // Edităm un job
  function editJob(id: number) {
    const job = jobs.find((item) => item.id === id);

    if (!job) return;

    const newCompany = window.prompt(
      "Numele companiei:",
      job.company
    );

    if (newCompany === null || !newCompany.trim()) return;

    const newPosition = window.prompt(
      "Poziția:",
      job.position
    );

    if (newPosition === null || !newPosition.trim()) return;

    const newDate = window.prompt(
      "Data aplicării (zz/ll/aaaa):",
      formatDate(job.date) === "Nespecificată"
        ? ""
        : formatDate(job.date)
    );

    if (newDate === null) return;

    if (newDate && !isValidDate(newDate)) {
      alert("Data introdusă nu este validă!");
      return;
    }

    setJobs((previousJobs) =>
      previousJobs.map((item) =>
        item.id === id
          ? {
              ...item,
              company: newCompany.trim(),
              position: newPosition.trim(),
              date: newDate,
            }
          : item
      )
    );
  }

  // Schimbăm statusul
  function updateStatus(id: number, status: string) {
    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job.id === id ? { ...job, status } : job
      )
    );
  }

  // Căutăm și filtrăm joburile
  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      job.company.toLowerCase().includes(searchText) ||
      job.position.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" || job.status === filter;

    return matchesSearch && matchesFilter;
  });

  // Statistici
  const totalApplications = jobs.length;

  const totalInterviews = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const totalOffers = jobs.filter(
    (job) => job.status === "Offer"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 sm:text-4xl">
            💼 Job Application Tracker
          </h1>

          <p className="mt-3 text-slate-400">
            Organizează și urmărește aplicațiile tale la joburi.
          </p>
        </header>

        {/* DASHBOARD */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              Total Applications
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {totalApplications}
            </h2>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              Interviews
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-400">
              {totalInterviews}
            </h2>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              Offers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-400">
              {totalOffers}
            </h2>
          </div>

        </section>

        {/* FORMULAR */}

        <section className="mt-8 rounded-xl bg-slate-900 p-6">

          <h2 className="mb-5 text-xl font-bold">
            ➕ Add New Job
          </h2>

          <label className="mb-2 block text-sm text-slate-400">
            Company Name
          </label>

          <input
            type="text"
            placeholder="Ex: Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mb-4 w-full rounded-lg bg-slate-800 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <label className="mb-2 block text-sm text-slate-400">
            Job Position
          </label>

          <input
            type="text"
            placeholder="Ex: Frontend Developer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="mb-4 w-full rounded-lg bg-slate-800 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <label className="mb-2 block text-sm text-slate-400">
            📅 Application Date
          </label>

          <input
            type="text"
            inputMode="numeric"
            placeholder="zz/ll/aaaa"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-2 w-full rounded-lg bg-slate-800 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <p className="mb-5 text-xs text-slate-500">
            Exemplu: 18/11/2026. Dacă lași câmpul gol,
            se folosește data curentă.
          </p>

          <button
            onClick={addJob}
            disabled={!loaded}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            + Add Job
          </button>

        </section>

        {/* CĂUTARE ȘI FILTRARE */}

        <section className="mt-8 grid gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="🔍 Search company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg bg-slate-800 p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg bg-slate-800 p-3 text-white"
          >
            <option value="All">All Applications</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

        </section>

        {/* LISTA JOBURILOR */}

        <section className="mt-8">

          <h2 className="mb-5 text-2xl font-bold">
            📋 My Applications ({filteredJobs.length})
          </h2>

          {!loaded && (
            <p className="text-slate-400">
              Se încarcă aplicațiile...
            </p>
          )}

          {loaded && jobs.length === 0 && (
            <p className="rounded-xl bg-slate-900 p-6 text-slate-400">
              Nu ai adăugat încă niciun job.
            </p>
          )}

          {loaded &&
            jobs.length > 0 &&
            filteredJobs.length === 0 && (
              <p className="rounded-xl bg-slate-900 p-6 text-slate-400">
                Nu există joburi care corespund căutării.
              </p>
            )}

          {loaded && filteredJobs.map((job) => (

            <div
              key={job.id}
              className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-900 p-5"
            >

              <div>
                <h3 className="text-xl font-bold">
                  {job.position}
                </h3>

                <p className="mt-1 text-slate-400">
                  🏢 {job.company}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  📅 Data aplicării: {formatDate(job.date)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">

                <select
                  value={job.status}
                  onChange={(e) =>
                    updateStatus(job.id, e.target.value)
                  }
                  className="rounded-lg bg-slate-800 p-2 text-white"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => editJob(job.id)}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                >
                  🗑️ Delete
                </button>

              </div>

            </div>

          ))}

        </section>

        {/* FOOTER */}

        <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          Job Application Tracker • Built with Next.js & React
        </footer>

      </div>
    </main>
  );
}