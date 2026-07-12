extends Control
class_name CameraFrame

@export var move_speed := 360.0
@export var resize_speed := 220.0
@export var min_size := Vector2(160, 120)
@export var max_size := Vector2(700, 520)

func _ready() -> void:
	queue_redraw()

func _process(delta: float) -> void:
	var move := Vector2.ZERO
	if Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A): move.x -= 1
	if Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D): move.x += 1
	if Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W): move.y -= 1
	if Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S): move.y += 1
	position += move.normalized() * move_speed * delta
	
	var resize := 0.0
	if Input.is_key_pressed(KEY_Q): resize -= 1
	if Input.is_key_pressed(KEY_E): resize += 1
	if resize != 0:
		var center := position + size / 2.0
		size += Vector2(resize_speed, resize_speed * 0.75) * resize * delta
		size.x = clamp(size.x, min_size.x, max_size.x)
		size.y = clamp(size.y, min_size.y, max_size.y)
		position = center - size / 2.0
	
	position.x = clamp(position.x, 0, 1280 - size.x)
	position.y = clamp(position.y, 0, 720 - size.y)
	queue_redraw()

func get_capture_rect() -> Rect2:
	return Rect2(global_position, size)

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color.WHITE, false, 4.0)
	# Rule-of-thirds guide lines.
	draw_line(Vector2(size.x / 3, 0), Vector2(size.x / 3, size.y), Color(1,1,1,0.45), 1.0)
	draw_line(Vector2(size.x * 2 / 3, 0), Vector2(size.x * 2 / 3, size.y), Color(1,1,1,0.45), 1.0)
	draw_line(Vector2(0, size.y / 3), Vector2(size.x, size.y / 3), Color(1,1,1,0.45), 1.0)
	draw_line(Vector2(0, size.y * 2 / 3), Vector2(size.x, size.y * 2 / 3), Color(1,1,1,0.45), 1.0)
