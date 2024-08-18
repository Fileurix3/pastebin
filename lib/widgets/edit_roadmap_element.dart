import 'package:custom_roadmap/bloc/roadmap%20element/roadmap_element_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class EditRoadmapElement extends StatefulWidget {
  final int id;
  final String name;
  final String description;

  const EditRoadmapElement(this.id, this.name, this.description, {super.key});

  @override
  State<EditRoadmapElement> createState() => _EditRoadmapElementState();
}

class _EditRoadmapElementState extends State<EditRoadmapElement> {
  TextEditingController nameController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    setState(() {
      nameController.text = widget.name;
      descriptionController.text = widget.description;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: "name",
                  ),
                  maxLength: 25,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: "description",
                  ),
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: null,
                ),
              ],
            ),
          ),
        ),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                style: ButtonStyle(
                  backgroundColor: WidgetStateProperty.all<Color>(
                    Theme.of(context).colorScheme.error,
                  ),
                ),
                onPressed: () {
                  context.read<RoadmapElementCubit>().deleteRoadmapElement(widget.id);
                  Navigator.pop(context);
                },
                child: const Icon(Icons.delete),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  context.read<RoadmapElementCubit>().updateRoadmapElement(
                        widget.id,
                        nameController.text,
                        descriptionController.text,
                      );
                  Navigator.pop(context);
                },
                child: const Icon(Icons.save),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
      ],
    );
  }
}
