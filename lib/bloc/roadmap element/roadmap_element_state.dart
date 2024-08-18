import 'package:custom_roadmap/model/roadmap_element_model.dart';
import 'package:custom_roadmap/services/roadmap_element_services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part './roadmap_element_cubit.dart';

class RoadmapElementState {}

class RoadmapElementLoading extends RoadmapElementState {}

class RoadmapElementLoaded extends RoadmapElementState {
  final List<RoadmapElementModel> roadmapElement;

  RoadmapElementLoaded(this.roadmapElement);
}

class RoadmapElementError extends RoadmapElementState {
  final String message;

  RoadmapElementError(this.message);
}
