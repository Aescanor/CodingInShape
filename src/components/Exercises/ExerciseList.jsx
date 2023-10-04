import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { EXERCISES_API } from "../API/apiAdminExercises";
import Spinner from "../../assets/icons/spinner.svg";
import { setUserData } from "../../../redux/slices/authSlice";
import ConditionalNavLinks from "../ConditionalNavLinks/ConditionalNavLinks";

export default function ExerciseList() {
  // État local :
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redux :
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const dispatch = useDispatch();

  // states filter :
  const [filterOptions, setFilterOptions] = useState({
    type: "",
    muscle: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [exercisePerPage] = useState(2);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        if (!isAuthenticated) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${EXERCISES_API}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setUserData(data));
          setExercises(data);
          setIsLoading(false);
        } else {
          console.error(
            "Impossible de récupérer les données des exercices. Statut HTTP :",
            response.status
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données des exercices :",
          error
        );
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [token, isAuthenticated, dispatch, navigate]);

  // Filtres :
  const filterExercises = (exercises, filterOptions) => {
    let filteredExercises = [...exercises];

    if (filterOptions.type) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.type === filterOptions.type
      );
    }

    if (filterOptions.muscle) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.muscle === filterOptions.muscle
      );
    }

    // Pagination :
    const indexOfLastExercise = currentPage * exercisePerPage;
    const indexOfFirstExercise = indexOfLastExercise - exercisePerPage;
    filteredExercises = filteredExercises.slice(
      indexOfFirstExercise,
      indexOfLastExercise
    );

    return filteredExercises;
  };

  return (
    <div>
      <h2>Liste des exercices disponibles :</h2>
      <div>
        <h3>Filtres :</h3>
        <label>Type :</label>
        <select
          value={filterOptions.type}
          onChange={(e) =>
            setFilterOptions({ ...filterOptions, type: e.target.value })
          }
        >
          <option value="">Tous</option>
          <option value="Upper Body">Haut du corps</option>
          <option value="Lower Body">Bas du corps</option>
        </select>
      </div>
      <div>
        <label>Muscle ciblé :</label>
        <select
          value={filterOptions.muscle}
          onChange={(e) =>
            setFilterOptions({ ...filterOptions, muscle: e.target.value })
          }
        >
          <option value="">Tous</option>
          <option value="Neck">Cervicaux</option>
          <option value="Shoulders">Épaules</option>
          <option value="Hips">Hanches</option>
          <option value="Legs">Jambes</option>
        </select>
      </div>
      <p>Exercices</p>
      {isLoading && <img src={Spinner} alt="Chargement en cours..." />}
      <ul>
        {filterExercises(exercises, filterOptions).map((exercise) => (
          <li key={exercise._id}>
            <h2>{exercise.name}</h2>
            <p>Description : {exercise.description}</p>
            <p>Type : {exercise.type}</p>
            <p>Muscle ciblé : {exercise.muscle}</p>
            <Link to={`/exercise-detail/${exercise._id}`}>
              Voir détail de l'exercice
            </Link>
            {isAdmin && (
              <>
                <Link to={`/update-exercise/${exercise._id}`}>
                  Modifier l'exercice
                </Link>
                <Link to={`/delete-exercise/${exercise._id}`}>
                  Supprimer l'exercice
                </Link>
              </>
            )}
            <img
              src={exercise.image}
              alt={`Image de ${exercise.name}`}
              width={"200px"}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Page précédente
      </button>

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === Math.ceil(exercises.length / exercisePerPage)}
      >
        Page suivante
      </button>
      <p>
        page {currentPage} sur {Math.ceil(exercises.length / exercisePerPage)}
      </p>

      <ConditionalNavLinks isAdmin={isAdmin} />

      <div className="navigate-links">
        {isAdmin && (
          <div className="navigate-link">
            <Link to={"/exercise-management"}>
              Retour à la gestion des exercices
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
/*📖 Composant admin - Exercises
Lire la liste des exercises
📖*/