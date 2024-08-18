part of 'custom_roadmap_state.dart';

class CustomRoadmapCubit extends Cubit<CustomRoadmapState> {
  final CustomRoadmapServices customRoadmapServices = CustomRoadmapServices();
  CustomRoadmapCubit() : super(CustomRoadmapState());

  Future<void> fetchRoadmaps() async {
    emit(CustomRoadmapLoading());
    try {
      final List<CustomRoadmapModel> roadmap = await customRoadmapServices.getRoadmaps();
      emit(CustomRoadmapLoaded(roadmap));
    } catch (e) {
      emit(CustomRoadmapError(e.toString()));
    }
  }

  Future<void> addNewRoadmap(String roadmapName) async {
    emit(CustomRoadmapLoading());
    try {
      await customRoadmapServices.addNewRoadmap(roadmapName);
      fetchRoadmaps();
    } catch (e) {
      emit(CustomRoadmapError(e.toString()));
    }
  }

  Future<void> updateRoadmapName(int id, String name) async {
    emit(CustomRoadmapLoading());
    try {
      await customRoadmapServices.updateRoadmapName(id, name);
      fetchRoadmaps();
    } catch (e) {
      emit(CustomRoadmapError(e.toString()));
    }
  }

  Future<void> deleteRoadmap(int id) async {
    emit(CustomRoadmapLoading());
    try {
      await customRoadmapServices.deleteRoadmap(id);
      fetchRoadmaps();
    } catch (e) {
      emit(CustomRoadmapError(e.toString()));
    }
  }
}
