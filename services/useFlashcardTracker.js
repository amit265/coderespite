import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { favoritesContext, userDetailsContext } from "../context/context";

export default function useFlashcardTracker(courseTitle) {
  const { favorites, setFavorites } = useContext(favoritesContext);
  const { updateCourse, userData } = useContext(userDetailsContext);

  const currentProgress = userData?.progress?.[courseTitle] || {};

  const markFlashcardViewed = async (item) => {
    const previousViewed = currentProgress.flashcardsViewed || [];
    const viewedDate = new Date().toISOString().split("T")[0];

    const alreadyViewed = previousViewed.some(
      (fc) => fc.question === item.question
    );
    if (alreadyViewed) return;

    const updatedViewed = [
      ...previousViewed,
      { question: item.question, answer: item.answer, date: viewedDate },
    ];

    await updateCourse(courseTitle, {
      ...currentProgress,
      flashcardsViewed: updatedViewed,
    });
  };

  const markFlashcardLoved = async (item) => {
    const previousLoved = currentProgress.flashcardsLoved || [];
    const alreadyLoved = previousLoved.some(
      (fc) => fc.question === item.question
    );
    if (alreadyLoved) return;

    const updatedLoved = [
      ...previousLoved,
      { question: item.question, answer: item.answer, date: new Date().toISOString().split("T")[0] },
    ];

    await updateCourse(courseTitle, {
      ...currentProgress,
      flashcardsLoved: updatedLoved,
    });
  };

  const removeFlashcardLoved = async (item) => {
    console.log("remove flash card called");
    
    const previousLoved = currentProgress.flashcardsLoved || [];

    const updatedLoved = previousLoved.filter(
      (fc) => fc.question !== item.question
    );

    await updateCourse(courseTitle, {
      ...currentProgress,
      flashcardsLoved: updatedLoved,
    });
  };

  const addFavorite = async (item, title) => {
    const newFavorite = {
      question: item.question,
      title,
      answer: item.answer,
    };

    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    const exists = currentFavorites.some(
      (fc) => fc.question === item.question
    );
    if (exists) return;

    const updatedFavorites = [...currentFavorites, newFavorite];
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const removeFavorite = async (question) => {
    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    const updatedFavorites = currentFavorites.filter(
      (fc) => fc.question !== question
    );
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const toggleLoved = async (item, title) => {
    const previousLoved = currentProgress.flashcardsLoved || [];
    const isLoved = previousLoved.some((fc) => fc.question === item.question);

    if (isLoved) {
      await removeFlashcardLoved(item);
      await removeFavorite(item.question);
    } else {
      await markFlashcardLoved(item);
      await addFavorite(item, title);
    }
  };

  return {
    markFlashcardViewed,
    markFlashcardLoved,
    removeFlashcardLoved,
    toggleLoved,
    addFavorite,
    removeFavorite,
    favorites,
  };
}
