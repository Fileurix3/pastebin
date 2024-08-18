import 'package:custom_roadmap/model/custom_roadmap_model.dart';
import 'package:custom_roadmap/services/custom_roadmap_services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'custom_roadmap_cubit.dart';

class CustomRoadmapState {}

class CustomRoadmapLoading extends CustomRoadmapState {}

class CustomRoadmapLoaded extends CustomRoadmapState {
  final List<CustomRoadmapModel> roadmap;

  CustomRoadmapLoaded(this.roadmap);
}

class CustomRoadmapError extends CustomRoadmapState {
  final String message;

  CustomRoadmapError(this.message);
}
