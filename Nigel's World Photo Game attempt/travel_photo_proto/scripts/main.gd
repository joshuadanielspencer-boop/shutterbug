extends Node2D

@onready var camera_frame: CameraFrame = $CameraFrame
@onready var score_label: RichTextLabel = $UI/ScoreLabel

func _ready() -> void:
	for child in get_children():
		if child is PhotoTarget:
			child.add_to_group("photo_targets")

var mission := {
	"required_tag": "landmark",
	"bonus_tags": ["food", "language"],
	"tiers": [
		{"name": "Tourist", "score": 400},
		{"name": "Explorer", "score": 700},
		{"name": "Pro", "score": 900}
	]
}

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_SPACE:
			take_photo()

func take_photo() -> void:
	var capture := camera_frame.get_capture_rect()
	var targets := get_tree().get_nodes_in_group("photo_targets")
	# Fallback because groups are not saved in this minimal .tscn.
	if targets.is_empty():
		targets = []
		for child in get_children():
			if child is PhotoTarget:
				targets.append(child)
	
	var score := 0
	var hit_names: Array[String] = []
	var hit_tags: Array[String] = []
	var notes: Array[String] = []
	
	for target in targets:
		var rect: Rect2 = target.get_rect_global()
		var overlap := capture.intersection(rect)
		if overlap.size.x > 0 and overlap.size.y > 0:
			var coverage := (overlap.size.x * overlap.size.y) / (rect.size.x * rect.size.y)
			if coverage >= 0.35:
				var points := int(target.base_points * min(coverage, 1.0))
				score += points
				hit_names.append(target.target_name)
				for tag in target.tags:
					if not hit_tags.has(tag): hit_tags.append(tag)
				notes.append("+ %s included: %d pts" % [target.target_name, points])
	
	if hit_tags.has(mission.required_tag):
		score += 250
		notes.append("+ Required landmark captured: 250 pts")
	else:
		notes.append("- Missed required landmark")
	
	for bonus_tag in mission.bonus_tags:
		if hit_tags.has(bonus_tag):
			score += 125
			notes.append("+ Bonus cultural clue (%s): 125 pts" % bonus_tag)
		else:
			notes.append("- Missing bonus clue: %s" % bonus_tag)
	
	var tier := "No tier"
	for t in mission.tiers:
		if score >= t.score:
			tier = t.name
	
	score_label.text = "[b]Photo Score: %d[/b]\nTier: %s\nSubjects: %s\n\n%s" % [
		score,
		tier,
		", ".join(hit_names) if not hit_names.is_empty() else "none",
		"\n".join(notes)
	]
