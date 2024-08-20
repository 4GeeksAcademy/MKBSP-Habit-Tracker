const HabitCard = ({ habit, index, levelKey, handleDeleteHabit }) => (
    <Draggable key={habit.habit_id} draggableId={String(habit.habit_id)} index={idx}>
        {(provided) => (
            <Box
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                p={1}
                mb={1}
                bgcolor="grey.200"
                borderRadius={1}
            >
                {habit.title}
                <Button variant="contained" color="secondary" onClick={() => handleDeleteHabit(habit.habit_id, index + 1)}>
                    Delete
                </Button>
            </Box>
        )}
    </Draggable>
)