const AddHabitModal = ({ isModalOpen, handleCloseModal, handleSearch, availableHabits, handleAddHabit, handleOpenHabitDetail }) => (
    <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Add Habit</DialogTitle>
        <DialogContent>
            <TextField placeholder="Search habits..." fullWidth margin="normal" onChange={handleSearch} />
            {availableHabits.map(habit => (
                <Box key={habit.uid} display="flex" justifyContent="space-between" mb={2} onClick={() => handleOpenHabitDetail(habit)}>
                    <span>{habit.title}</span>
                    <Button variant="contained" color="primary" onClick={() => handleAddHabit(habit)}>
                        Add
                    </Button>
                </Box>
            ))}
        </DialogContent>
    </Dialog>
);
