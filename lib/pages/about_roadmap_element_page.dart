import 'package:custom_roadmap/bloc/roadmap%20element/roadmap_element_state.dart';
import 'package:custom_roadmap/widgets/edit_roadmap_element.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AboutRoadmapElementPage extends StatefulWidget {
  const AboutRoadmapElementPage({super.key});

  @override
  State<AboutRoadmapElementPage> createState() => _AboutRoadmapElementPageState();
}

class _AboutRoadmapElementPageState extends State<AboutRoadmapElementPage> {
  bool isEdit = false;
  late int index;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    index = args["index"];
    context.read<RoadmapElementCubit>().fetchRoadmapElement(args["id"]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                isEdit = !isEdit;
              });
            },
            icon: isEdit == false ? const Icon(Icons.edit) : const Icon(Icons.close),
          )
        ],
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
            if (state.roadmapElement.isNotEmpty) {
              return Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: MediaQuery.of(context).size.width / 20,
                ),
                child: isEdit == false
                    ? Center(
                        child: Column(
                          children: [
                            Text(
                              state.roadmapElement[index].name,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text(
                              state.roadmapElement[index].description,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      )
                    : EditRoadmapElement(
                        state.roadmapElement[index].id,
                        state.roadmapElement[index].name,
                        state.roadmapElement[index].description,
                      ),
              );
            } else {
              return Center(
                child: Text(
                  "No roadmap element found",
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              );
            }
          }
          if (state is RoadmapElementError) {
            return Center(
              child: Text(
                state.message,
                style: Theme.of(context).textTheme.labelMedium,
              ),
            );
          }
          return Center(
            child: Text(
              "error",
              style: Theme.of(context).textTheme.labelMedium,
            ),
          );
        },
      ),
    );
  }
}
