import ReadingChallenge from "../models/readingChallenge.model.js";
import BookList from "../models/bookList.model.js";

// ------------------------
// Create Challenge
// ------------------------
export const createChallenge = async (req, res) => {
    try {
        const { title, goalBooks, goalPages, startDate, endDate, genres, presetType } = req.body;
        
        // Check for duplicate title
        const existingTitle = await ReadingChallenge.findOne({ user: req.user._id, title });
        if (existingTitle) {
            return res.status(400).json({ message: "You already have a challenge with this name" });
        }

        // Check for active same preset
        if (presetType && presetType !== "custom") {
            const existingPreset = await ReadingChallenge.findOne({ 
                user: req.user._id, 
                presetType, 
                status: "active" 
            });
            if (existingPreset) {
                return res.status(400).json({ message: `You already have an active ${presetType.replace("_", " ")} challenge` });
            }
        }

        const challenge = await ReadingChallenge.create({
            user: req.user._id,
            title,
            goalBooks,
            goalPages: goalPages || 0,
            startDate,
            endDate,
            presetType: presetType || "custom",
            genres: genres || []
        });

        res.status(201).json({ message: "Challenge created", challenge });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating challenge" });
    }
};

// ------------------------
// Get User Challenges
// ------------------------
export const getUserChallenges = async (req, res) => {
    try {
        const challenges = await ReadingChallenge.find({ user: req.user._id }).sort({ createdAt: -1 });

        // Update progress for each active challenge
        const updatedChallenges = await Promise.all(challenges.map(async (challenge) => {
            if (challenge.status === "active") {
                // Calculate actual progress from lists
                const userLists = await BookList.find({ user: req.user._id });
                
                const readBooks = new Set();
                let totalPagesRead = 0;

                userLists.forEach(list => {
                    list.books.forEach(book => {
                        if (book.readingStatus === "read" && book.readAt) {
                            const readDate = new Date(book.readAt);
                            if (readDate >= challenge.startDate && readDate <= challenge.endDate) {
                                // Filter by genre if specified
                                if (challenge.genres.length === 0 || 
                                    (book.categories && book.categories.some(cat => challenge.genres.includes(cat)))) {
                                    readBooks.add(book.googleBookId);
                                    // pages logic could be added here if book had pageCount
                                }
                            }
                        }
                    });
                });

                challenge.booksRead = Array.from(readBooks);
                // challenge.pagesRead = totalPagesRead; // Placeholder

                if (challenge.booksRead.length >= challenge.goalBooks) {
                    challenge.status = "completed";
                } else if (new Date() > challenge.endDate) {
                    challenge.status = "expired";
                }

                await challenge.save();
            }
            
            // Inject computed fields
            const challengeObj = challenge.toObject();
            if (challenge.status === 'active' || challenge.status === 'completed') {
                const now = new Date();
                const end = new Date(challenge.endDate);
                const diffTime = end - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                challengeObj.daysRemaining = diffDays > 0 ? diffDays : 0;
            } else {
                challengeObj.daysRemaining = 0;
            }
            
            return challengeObj;
        }));

        res.status(200).json({ challenges: updatedChallenges });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching challenges" });
    }
};

// ------------------------
// Delete Challenge
// ------------------------
export const deleteChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const challenge = await ReadingChallenge.findById(challengeId);
        
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });
        if (!challenge.user.equals(req.user._id)) return res.status(403).json({ message: "Unauthorized" });

        await challenge.deleteOne();
        res.status(200).json({ message: "Challenge deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting challenge" });
    }
};
