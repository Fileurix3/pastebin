part of './roadmap_element_state.dart';

class RoadmapElementCubit extends Cubit<RoadmapElementState> {
  final RoadmapElementServices roadmapElementServices = RoadmapElementServices();

  RoadmapElementCubit() : super(RoadmapElementState());

  Future<void> fetchRoadmapElements(int roadmapId) async {
    emit(RoadmapElementLoading());
    try {
      final List<RoadmapElementModel> roadmapElements =
          await roadmapElementServices.getRoadmapElemets(roadmapId);
      emit(RoadmapElementLoaded(roadmapElements));
    } catch (e) {
      emit(RoadmapElementError(e.toString()));
    }
  }

  Future<void> fetchRoadmapElement(int id) async {
    emit(RoadmapElementLoading());
    try {
      final List<RoadmapElementModel> roadmapElements =
          await roadmapElementServices.getRoadmapElemet(id);
      emit(RoadmapElementLoaded(roadmapElements));
    } catch (e) {
      emit(RoadmapElementError(e.toString()));
    }
  }

  Future<void> addRoadmapElement(int roadmapId, String name, String description) async {
    emit(RoadmapElementLoading());
    try {
      await roadmapElementServices.addNewRoadmapElement(
        roadmapId,
        name,
        description,
      );
      fetchRoadmapElements(roadmapId);
    } catch (e) {
      emit(RoadmapElementError(e.toString()));
    }
  }

  void updateRoadmapElement(int id, String name, String description) async {
    emit(RoadmapElementLoading());
    try {
      await roadmapElementServices.updateRoadmapElement(
        id,
        name,
        description,
      );
      fetchRoadmapElement(id);
    } catch (e) {
      emit(RoadmapElementError(e.toString()));
    }
  }

  void updateIsCompleted(int roadmapId, int elementId, int value) async {
    emit(RoadmapElementLoading());
    try {
      await roadmapElementServices.updateIsCompleted(elementId, value);
      fetchRoadmapElements(roadmapId);
    } catch (e) {
      emit(RoadmapElementError(e.toString()));
    }
  }

  void deleteRoadmapElement(int id) async {
    emit(RoadmapElementLoading());
    try {
      await roadmapElementServices.deleteRoadmapElement(id);
      fetchRoadmapElement(id);
    } catch (e) {
      emit(RoadmapElementError(e.toString()));
    }
  }

  Future<double> getPercentageCompleted(int roadmapId) async {
    final result = await roadmapElementServices.getPercentageCompleted(roadmapId);
    return result;
  }
}
