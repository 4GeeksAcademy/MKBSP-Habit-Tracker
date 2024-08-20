const HabitDetailModal = ({ selectedHabit, handleCloseHabitDetail, handleAddHabit, currentLevel }) => (
    <Dialog open={!!selectedHabit} onClose={handleCloseHabitDetail}>
        <DialogTitle>{selectedHabit?.title}</DialogTitle>
        <DialogContent>
            <p>{selectedHabit?.description}</p>
            <Button onClick={() => handleAddHabit(selectedHabit)}>Add to Level {currentLevel}</Button>
        </DialogContent>
    </Dialog>
);
