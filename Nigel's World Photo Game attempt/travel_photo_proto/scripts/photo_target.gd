extends ColorRect
class_name PhotoTarget

@export var target_name: String = "Target"
@export var tags: PackedStringArray = []
@export var base_points: int = 100

func get_rect_global() -> Rect2:
	return Rect2(global_position, size)
