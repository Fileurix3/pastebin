import 'package:custom_roadmap/bloc/custom%20roadmap/custom_roadmap_state.dart';
import 'package:custom_roadmap/bloc/roadmap%20element/roadmap_element_state.dart';
import 'package:custom_roadmap/bloc/theme/theme_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_slidable/flutter_slidable.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  TextEditingController roadmapNameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<CustomRoadmapCubit>().fetchRoadmaps();
  }

  void addNewRoadmap() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Add new roadmap"),
          content: TextField(
            controller: roadmapNameController,
            decoration: const InputDecoration(
              labelText: "roadmap name",
            ),
            style: Theme.of(context).textTheme.bodyMedium,
            maxLength: 25,
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                if (roadmapNameController.text.isNotEmpty) {
                  context.read<CustomRoadmapCubit>().addNewRoadmap(roadmapNameController.text);
                }
                roadmapNameController.clear();
                Navigator.pop(context);
              },
              child: const Center(
                child: Text("Add roadmap"),
              ),
            ),
          ],
        );
      },
    );
  }

  void editRoadmapName(int id, String name) {
    setState(() {
      roadmapNameController.text = name;
    });
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Edit roadmap name"),
          content: TextField(
            controller: roadmapNameController,
            decoration: const InputDecoration(
              labelText: "roadmap name",
            ),
            style: Theme.of(context).textTheme.bodyMedium,
            maxLength: 25,
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                if (roadmapNameController.text.isNotEmpty) {
                  context
                      .read<CustomRoadmapCubit>()
                      .updateRoadmapName(id, roadmapNameController.text);
                }
                roadmapNameController.clear();
                Navigator.pop(context);
              },
              child: const Center(
                child: Text("Save"),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text(
          "Roadmaps list",
        ),
        actions: [
          BlocBuilder<ThemeCubit, ThemeState>(
            builder: (context, state) {
              return Padding(
                padding: const EdgeInsets.all(2),
                child: InkWell(
                  borderRadius: BorderRadius.circular(100),
                  onTap: () {
                    context.read<ThemeCubit>().toggleTheme();
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(6),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 100),
                      transitionBuilder: (child, animation) {
                        return ScaleTransition(
                          scale: animation,
                          child: child,
                        );
                      },
                      child: state.darkTheme == false
                          ? const Icon(
                              Icons.nights_stay,
                              key: ValueKey<int>(1),
                            )
                          : const Icon(
                              Icons.light_mode,
                              key: ValueKey<int>(2),
                            ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<CustomRoadmapCubit, CustomRoadmapState>(
        builder: (context, state) {
          if (state is CustomRoadmapLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is CustomRoadmapError) {
            return Center(
              child: Text(
                state.message,
                style: Theme.of(context).textTheme.labelMedium,
              ),
            );
          } else if (state is CustomRoadmapLoaded) {
            if (state.roadmap.isEmpty) {
              return Center(
                child: Text(
                  "Nothing found",
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              );
            } else if (state.roadmap.isNotEmpty) {
              return ListView.builder(
                itemCount: state.roadmap.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: MediaQuery.of(context).size.width / 30,
                      vertical: 10,
                    ),
                    child: Slidable(
                      startActionPane: ActionPane(
                        motion: const StretchMotion(),
                        children: [
                          SlidableAction(
                            borderRadius: BorderRadius.circular(14),
                            backgroundColor: Theme.of(context).colorScheme.error,
                            onPressed: (context) {
                              context
                                  .read<CustomRoadmapCubit>()
                                  .deleteRoadmap(state.roadmap[index].id);
                            },
                            icon: Icons.delete,
                          ),
                          SlidableAction(
                            borderRadius: BorderRadius.circular(14),
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            onPressed: (context) {
                              editRoadmapName(
                                  state.roadmap[index].id, state.roadmap[index].roadmapName);
                            },
                            icon: Icons.edit,
                          ),
                        ],
                      ),
                      endActionPane: ActionPane(
                        motion: const StretchMotion(),
                        children: [
                          SlidableAction(
                            borderRadius: BorderRadius.circular(14),
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            onPressed: (context) {
                              editRoadmapName(
                                  state.roadmap[index].id, state.roadmap[index].roadmapName);
                            },
                            icon: Icons.edit,
                          ),
                          SlidableAction(
                            borderRadius: BorderRadius.circular(14),
                            backgroundColor: Theme.of(context).colorScheme.error,
                            onPressed: (context) {
                              context
                                  .read<CustomRoadmapCubit>()
                                  .deleteRoadmap(state.roadmap[index].id);
                            },
                            icon: Icons.delete,
                          ),
                        ],
                      ),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            "/roadmapPage",
                            arguments: {
                              "name": state.roadmap[index].roadmapName,
                              "id": state.roadmap[index].id,
                            },
                          );
                        },
                        child: Ink(
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              color: Theme.of(context).colorScheme.tertiary,
                              boxShadow: [
                                BoxShadow(
                                  color: Theme.of(context).colorScheme.shadow,
                                  spreadRadius: 2,
                                  blurRadius: 15,
                                  offset: const Offset(2, 5),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Column(
                                children: [
                                  Text(
                                    state.roadmap[index].roadmapName,
                                    style: Theme.of(context).textTheme.labelMedium,
                                    textAlign: TextAlign.center,
                                  ),
                                  FutureBuilder<double>(
                                    future: context
                                        .read<RoadmapElementCubit>()
                                        .getPercentageCompleted(state.roadmap[index].id),
                                    builder: (context, snapshot) {
                                      return Text(
                                        "completed: ${snapshot.data}%",
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              );
            }
          }
          return Center(
            child: Text(
              "error",
              style: Theme.of(context).textTheme.labelMedium,
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          addNewRoadmap();
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
