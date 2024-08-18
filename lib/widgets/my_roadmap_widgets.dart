import 'package:custom_roadmap/bloc/roadmap%20element/roadmap_element_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:timeline_tile/timeline_tile.dart';

class MyRoadmapWidget extends StatelessWidget {
  final int id;
  final int roadmapId;
  final String title;
  final String description;
  final int isCompleted;
  final bool isFirst;
  final bool isLast;
  final int index;

  const MyRoadmapWidget({
    super.key,
    required this.id,
    required this.roadmapId,
    required this.title,
    required this.description,
    required this.isCompleted,
    required this.isFirst,
    required this.isLast,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      width: MediaQuery.of(context).size.width,
      child: TimelineTile(
        alignment: TimelineAlign.manual,
        lineXY: 0.17,
        isFirst: isFirst,
        isLast: isLast,
        beforeLineStyle: LineStyle(
          color: isCompleted == 0
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).colorScheme.secondary,
        ),
        indicatorStyle: IndicatorStyle(
          color: isCompleted == 0
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).colorScheme.secondary,
          width: MediaQuery.of(context).size.width / 8,
          iconStyle: IconStyle(
            iconData: isCompleted == 0 ? Icons.clear : Icons.done,
            color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black,
          ),
        ),
        startChild: Checkbox(
          value: isCompleted == 0 ? false : true,
          onChanged: (value) {
            context
                .read<RoadmapElementCubit>()
                .updateIsCompleted(roadmapId, id, value == true ? 1 : 0);
          },
        ),
        endChild: Padding(
          padding: const EdgeInsets.all(15),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              Navigator.pushNamed(
                context,
                "/aboutRoadmapElementPage",
                arguments: {
                  "id": id,
                  "index": index,
                },
              );
            },
            child: Ink(
              padding: const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: isCompleted == 0
                    ? Theme.of(context).colorScheme.primary
                    : Theme.of(context).colorScheme.secondary,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.labelMedium,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
