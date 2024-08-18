import 'package:custom_roadmap/bloc/roadmap%20element/roadmap_element_state.dart';
import 'package:custom_roadmap/widgets/my_roadmap_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class RoadmapPage extends StatefulWidget {
  const RoadmapPage({super.key});

  @override
  State<RoadmapPage> createState() => _RoadmapPageState();
}

class _RoadmapPageState extends State<RoadmapPage> {
  TextEditingController nameController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();

  late String roadmapName;
  late int roadmapId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final argument = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    roadmapId = argument["id"];
    roadmapName = argument["name"];
    context.read<RoadmapElementCubit>().fetchRoadmapElements(argument["id"]);
  }

  void addRoadmapElement() {
    showDialog(
      context: context,
      builder: (coontext) {
        return AlertDialog(
          title: const Text("New roadmap element"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: "name",
                ),
                style: Theme.of(context).textTheme.bodyMedium,
                maxLength: 50,
              ),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: "description",
                ),
                style: Theme.of(context).textTheme.bodyMedium,
                minLines: 1,
                maxLines: 5,
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty && descriptionController.text.isNotEmpty) {
                  context.read<RoadmapElementCubit>().addRoadmapElement(
                        roadmapId,
                        nameController.text,
                        descriptionController.text,
                      );
                  Navigator.pop(context);
                  nameController.clear();
                  descriptionController.clear();
                }
              },
              child: const Center(child: Text("Add element")),
            )
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          roadmapName,
        ),
      ),
      body: BlocBuilder<RoadmapElementCubit, RoadmapElementState>(
        builder: (context, state) {
          if (state is RoadmapElementLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is RoadmapElementError) {
            return Center(
              child: Text(
                state.message,
                style: Theme.of(context).textTheme.labelMedium,
              ),
            );
          } else if (state is RoadmapElementLoaded) {
            if (state.roadmapElement.isEmpty) {
              return Center(
                child: Text(
                  "Nothing yet",
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              );
            }
            return ListView.builder(
              itemCount: state.roadmapElement.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(
                    left: MediaQuery.of(context).size.width / 100,
                  ),
                  child: Column(
                    children: [
                      MyRoadmapWidget(
                        id: state.roadmapElement[index].id,
                        roadmapId: state.roadmapElement[index].roadmapId,
                        title: state.roadmapElement[index].name,
                        description: state.roadmapElement[index].description,
                        isCompleted: state.roadmapElement[index].isCompleted,
                        isFirst: index == 0 ? true : false,
                        isLast: index == state.roadmapElement.length - 1 ? true : false,
                      ),
                    ],
                  ),
                );
              },
            );
          }
          return const Text("error");
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          addRoadmapElement();
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
